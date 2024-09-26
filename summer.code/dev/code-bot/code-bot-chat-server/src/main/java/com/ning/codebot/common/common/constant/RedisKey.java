package com.ning.codebot.common.common.constant;


public class RedisKey {
    private static final String BASE_KEY = "codebot:chat";
    /**
     * User token key
     */
    public static final String USER_TOKEN_STRING = "userToken:uid_%d";

    public static String getKey(String key, Object... o) {
        return BASE_KEY + String.format(key, o);
    }
}
