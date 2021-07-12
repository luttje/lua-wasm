ifndef LUA_VERSION
ifeq (, $(shell which node))
LUA_VERSION:=5.4.3
EXPORTED_FUNCTIONS:=['_lua_absindex', '_lua_arith', '_lua_atpanic', '_lua_callk', '_lua_checkstack', '_lua_close', '_lua_compare', '_lua_concat', '_lua_copy', '_lua_createtable', '_lua_dump', '_lua_error', '_lua_gc', '_lua_getallocf', '_lua_getfield', '_lua_getglobal', '_lua_geti', '_lua_getmetatable', '_lua_gettable', '_lua_gettop', '_lua_iscfunction', '_lua_isinteger', '_lua_isnumber', '_lua_isstring', '_lua_isuserdata', '_lua_isyieldable', '_lua_len', '_lua_load', '_lua_newstate', '_lua_newthread', '_lua_next', '_lua_pcallk', '_lua_pushboolean', '_lua_pushcclosure', '_lua_pushfstring', '_lua_pushinteger', '_lua_pushlightuserdata', '_lua_pushlstring', '_lua_pushnil', '_lua_pushnumber', '_lua_pushstring', '_lua_pushthread', '_lua_pushvalue', '_lua_pushvfstring', '_lua_rawequal', '_lua_rawget', '_lua_rawgeti', '_lua_rawgetp', '_lua_rawlen', '_lua_rawset', '_lua_rawseti', '_lua_rawsetp', '_lua_resume', '_lua_rotate', '_lua_setallocf', '_lua_setfield', '_lua_setglobal', '_lua_seti', '_lua_setmetatable', '_lua_settable', '_lua_settop', '_lua_status', '_lua_stringtonumber', '_lua_toboolean', '_lua_tocfunction', '_lua_tointegerx', '_lua_tolstring', '_lua_tonumberx', '_lua_topointer', '_lua_tothread', '_lua_touserdata', '_lua_type', '_lua_typename', '_lua_version', '_lua_xmove', '_lua_yieldk', '_lua_gethook', '_lua_gethookcount', '_lua_gethookmask', '_lua_getinfo', '_lua_getlocal', '_lua_getstack', '_lua_getupvalue', '_lua_sethook', '_lua_setlocal', '_lua_setupvalue', '_lua_upvalueid', '_lua_upvaluejoin', '_luaL_addlstring', '_luaL_addstring', '_luaL_addvalue', '_luaL_argerror', '_luaL_buffinit', '_luaL_buffinitsize', '_luaL_callmeta', '_luaL_checkany', '_luaL_checkinteger', '_luaL_checklstring', '_luaL_checknumber', '_luaL_checkoption', '_luaL_checkstack', '_luaL_checktype', '_luaL_checkudata', '_luaL_error', '_luaL_execresult', '_luaL_fileresult', '_luaL_getmetafield', '_luaL_getsubtable', '_luaL_gsub', '_luaL_len', '_luaL_loadbufferx', '_luaL_loadfilex', '_luaL_loadstring', '_luaL_newmetatable', '_luaL_newstate', '_luaL_openlibs', '_luaL_optinteger', '_luaL_optlstring', '_luaL_optnumber', '_luaL_prepbuffsize', '_luaL_pushresult', '_luaL_pushresultsize', '_luaL_ref', '_luaL_requiref', '_luaL_setfuncs', '_luaL_setmetatable', '_luaL_testudata', '_luaL_tolstring', '_luaL_traceback', '_luaL_unref', '_luaL_where']

$(info LUA_VERSION not provided, falling back to default version: $(LUA_VERSION))
$(warning No node in $(PATH), install NodeJS to automatically fetch latest Lua version.)
else
$(eval LUA_VERSION=$(shell node tools/fetch-latest-lua-version/index.js))
$(info LUA_VERSION not provided, fetching latest version which is: $(LUA_VERSION))
endif
else
$(info User provided Lua version is: $(LUA_VERSION))
endif

LUA_TARBALL=lua-$(LUA_VERSION).tar.gz
LUA_SRC=lua-$(LUA_VERSION)/src
LUA_LIB=$(LUA_SRC)/liblua.a
DOCS_PATH:=docs/

CFLAGS:=-O2

EXPORTED_RUNTIME=-s EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']"
EMCC:=emcc -s WASM=1
EMAR:=emar rcu

COMPILER:=make

.PHONY: all
ifndef EXPORTED_FUNCTIONS
all: directories scanliblua docs
else
all: directories liblua docs
endif

# Download the Lua Sources
$(LUA_TARBALL):
	wget https://www.lua.org/ftp/$(LUA_TARBALL)

# Unpack the Lua sources
$(LUA_SRC): $(LUA_TARBALL)
	tar xvfz $(LUA_TARBALL)

# Build the Lua sources using Emscripten
$(LUA_LIB): $(LUA_SRC)
	$(COMPILER) -C $(LUA_SRC) CC="$(EMCC)" AR="$(EMAR)" liblua.a
	emar s $(LUA_LIB)

# Create the output directory
.PHONY: directories
directories: 
	mkdir -p dist/

# Generate the .js, .wasm and .html
liblua: $(LUA_LIB)
	$(EMCC) $(CFLAGS) $(EXPORTED_RUNTIME) -s EXPORTED_FUNCTIONS='$(EXPORTED_FUNCTIONS)' $< -o dist/liblua-$(LUA_VERSION).html --shell-file tools/example_template.html

# First scan the Lua sources and it's manual for functions
scanliblua: $(LUA_LIB)
	node tools/scrape-lua-signatures/index.js -version $(LUA_VERSION) -source $(LUA_SRC) -output $(DOCS_PATH)
	sleep 1 
	$(EMCC) $(CFLAGS) $(EXPORTED_RUNTIME) -s EXPORTED_FUNCTIONS='$(shell cat $(DOCS_PATH)luafunctions.json)' $< -o dist/liblua-$(LUA_VERSION).html --shell-file tools/example_template.html

# Prepare the .html, .wasm and .js for the example in the docs directory
.PHONY: docs
docs:
	mv dist/liblua-$(LUA_VERSION).html $(DOCS_PATH)index.html
	cp -f dist/liblua-$(LUA_VERSION).js $(DOCS_PATH)liblua-$(LUA_VERSION).js
	cp -f dist/liblua-$(LUA_VERSION).wasm $(DOCS_PATH)liblua-$(LUA_VERSION).wasm

# Cleanup the Lua sources
.PHONY: clean
clean: 
	rm -rf lua-*
	rm -f lua-*.tar.gz
