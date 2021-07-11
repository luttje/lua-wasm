// See ./tools/extract-lua-signatures.js to get an idea how to build this
let luaFunctions = {
  "lua_absindex": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_arith": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_atpanic": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_callk": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_checkstack": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_close": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_closeslot": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_compare": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_concat": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_copy": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_createtable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_dump": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_error": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_gc": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_getallocf": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_getfield": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "lua_getglobal": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "lua_geti": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_getmetatable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_gettable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_gettop": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_getiuservalue": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_iscfunction": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_isinteger": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_isnumber": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_isstring": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_isuserdata": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_isyieldable": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_len": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_load": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "string",
      "string"
    ]
  },
  "lua_newstate": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_newthread": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_newuserdatauv": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_next": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_pcallk": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_pushboolean": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_pushcclosure": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_pushfstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "lua_pushinteger": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_pushlightuserdata": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_pushlstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "lua_pushnil": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_pushnumber": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_pushstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "lua_pushthread": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_pushvalue": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_pushvfstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "lua_rawequal": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_rawget": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_rawgeti": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_rawgetp": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_rawlen": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_rawset": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_rawseti": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_rawsetp": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_resetthread": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_resume": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_rotate": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_setallocf": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_setfield": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "lua_setglobal": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "lua_seti": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_setiuservalue": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_setmetatable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_settable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_settop": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_setwarnf": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_status": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_stringtonumber": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "lua_toboolean": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_tocfunction": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_toclose": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_tointegerx": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_tolstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_tonumberx": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_topointer": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_tothread": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_touserdata": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_type": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_typename": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "lua_version": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_warning": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "lua_xmove": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_yieldk": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_gethook": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_gethookcount": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_gethookmask": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "lua_getinfo": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "lua_getlocal": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_getstack": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_getupvalue": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_sethook": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "lua_setlocal": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_setupvalue": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_upvalueid": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "lua_upvaluejoin": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number",
      "number",
      "number"
    ]
  },
  "luaL_addgsub": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "string",
      "string"
    ]
  },
  "luaL_addlstring": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "luaL_addstring": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "luaL_addvalue": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "luaL_argerror": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_buffinit": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_buffinitsize": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_callmeta": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_checkany": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_checkinteger": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_checklstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_checknumber": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_checkoption": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string",
      "string"
    ]
  },
  "luaL_checkstack": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_checktype": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_checkudata": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_error": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "number"
    ]
  },
  "luaL_execresult": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_fileresult": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_getmetafield": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_getsubtable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_gsub": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "string",
      "string",
      "string"
    ]
  },
  "luaL_len": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_loadbufferx": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "number",
      "string",
      "string"
    ]
  },
  "luaL_loadfilex": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "string"
    ]
  },
  "luaL_loadstring": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "luaL_newmetatable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "luaL_newstate": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "luaL_openlibs": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "luaL_optinteger": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_optlstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "string",
      "number"
    ]
  },
  "luaL_optnumber": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_prepbuffsize": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_pushresult": {
    "returnType": "number",
    "parameterTypes": [
      "number"
    ]
  },
  "luaL_pushresultsize": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_ref": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  },
  "luaL_requiref": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string",
      "number",
      "number"
    ]
  },
  "luaL_setfuncs": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_setmetatable": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "string"
    ]
  },
  "luaL_testudata": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_tolstring": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_traceback": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "string",
      "number"
    ]
  },
  "luaL_typeerror": {
    "returnType": "string",
    "parameterTypes": [
      "number",
      "number",
      "string"
    ]
  },
  "luaL_unref": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number",
      "number"
    ]
  },
  "luaL_where": {
    "returnType": "number",
    "parameterTypes": [
      "number",
      "number"
    ]
  }
}