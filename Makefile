# Based on code by François Perrad
# Check out the original file at https://framagit.org/fperrad/lua.wasm/-/blob/master/Makefile

LUA_VERSION:=5.4.3
LUA_TARBALL:=lua-$(LUA_VERSION).tar.gz
LUA_SRC:=lua-$(LUA_VERSION)/src
LUA_LIB:=$(LUA_SRC)/liblua.a

CFLAGS=-O2
OPTIONS=-s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap']" \
        -s EXPORTED_FUNCTIONS="['_lua_absindex', '_lua_arith', '_lua_atpanic', '_lua_callk', '_lua_checkstack', '_lua_close', '_lua_closeslot', '_lua_compare', '_lua_concat', '_lua_copy', '_lua_createtable', '_lua_dump', '_lua_error', '_lua_gc', '_lua_getallocf', '_lua_getfield', '_lua_getglobal', '_lua_geti', '_lua_getmetatable', '_lua_gettable', '_lua_gettop', '_lua_getiuservalue', '_lua_iscfunction', '_lua_isinteger', '_lua_isnumber', '_lua_isstring', '_lua_isuserdata', '_lua_isyieldable', '_lua_len', '_lua_load', '_lua_newstate', '_lua_newthread', '_lua_newuserdatauv', '_lua_next', '_lua_pcallk', '_lua_pushboolean', '_lua_pushcclosure', '_lua_pushfstring', '_lua_pushinteger', '_lua_pushlightuserdata', '_lua_pushlstring', '_lua_pushnil', '_lua_pushnumber', '_lua_pushstring', '_lua_pushthread', '_lua_pushvalue', '_lua_pushvfstring', '_lua_rawequal', '_lua_rawget', '_lua_rawgeti', '_lua_rawgetp', '_lua_rawlen', '_lua_rawset', '_lua_rawseti', '_lua_rawsetp', '_lua_resetthread', '_lua_resume', '_lua_rotate', '_lua_setallocf', '_lua_setfield', '_lua_setglobal', '_lua_seti', '_lua_setiuservalue', '_lua_setmetatable', '_lua_settable', '_lua_settop', '_lua_setwarnf', '_lua_status', '_lua_stringtonumber', '_lua_toboolean', '_lua_tocfunction', '_lua_toclose', '_lua_tointegerx', '_lua_tolstring', '_lua_tonumberx', '_lua_topointer', '_lua_tothread', '_lua_touserdata', '_lua_type', '_lua_typename', '_lua_version', '_lua_warning', '_lua_xmove', '_lua_yieldk', '_lua_gethook', '_lua_gethookcount', '_lua_gethookmask', '_lua_getinfo', '_lua_getlocal', '_lua_getstack', '_lua_getupvalue', '_lua_sethook', '_lua_setlocal', '_lua_setupvalue', '_lua_upvalueid', '_lua_upvaluejoin', '_luaL_addgsub', '_luaL_addlstring', '_luaL_addstring', '_luaL_addvalue', '_luaL_argerror', '_luaL_buffinit', '_luaL_buffinitsize', '_luaL_callmeta', '_luaL_checkany', '_luaL_checkinteger', '_luaL_checklstring', '_luaL_checknumber', '_luaL_checkoption', '_luaL_checkstack', '_luaL_checktype', '_luaL_checkudata', '_luaL_error', '_luaL_execresult', '_luaL_fileresult', '_luaL_getmetafield', '_luaL_getsubtable', '_luaL_gsub', '_luaL_len', '_luaL_loadbufferx', '_luaL_loadfilex', '_luaL_loadstring', '_luaL_newmetatable', '_luaL_newstate', '_luaL_openlibs', '_luaL_optinteger', '_luaL_optlstring', '_luaL_optnumber', '_luaL_prepbuffsize', '_luaL_pushresult', '_luaL_pushresultsize', '_luaL_ref', '_luaL_requiref', '_luaL_setfuncs', '_luaL_setmetatable', '_luaL_testudata', '_luaL_tolstring', '_luaL_traceback', '_luaL_typeerror', '_luaL_unref', '_luaL_where']"
EMCC=emcc -s WASM=1
EMAR=emar rcu

BUILDER=make
target all-mingw32: BUILDER=mingw32-make

.PHONY: all
all: liblua.js
all-mingw32: all

# Download the Lua Sources
$(LUA_TARBALL):
	wget https://www.lua.org/ftp/$(LUA_TARBALL)

# Unpack the Lua sources
$(LUA_SRC): $(LUA_TARBALL)
	tar xvfz $(LUA_TARBALL)

# Build the Lua sources using Emscripten
$(LUA_LIB): $(LUA_SRC)
	$(BUILDER) -C $(LUA_SRC) CC="$(EMCC)" AR="$(EMAR)" liblua.a
	emar s $(LUA_LIB)

# Generate the .js, .wasm and .html to the docs folder
liblua.js: $(LUA_LIB)
	$(EMCC) $(CFLAGS) $(OPTIONS) $< -o docs/liblua.html --shell-file tools/html_template.html --minify 0

.PHONY: clean
clean: 
	rm -rf lua-*
	rm -f lua-*.tar.gz
