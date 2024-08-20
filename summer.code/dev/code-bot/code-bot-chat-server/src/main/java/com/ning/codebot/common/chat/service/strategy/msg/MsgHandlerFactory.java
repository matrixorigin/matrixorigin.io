package com.ning.codebot.common.chat.service.strategy.msg;
import java.util.HashMap;
import java.util.Map;


public class MsgHandlerFactory {
    private static final Map<Integer, AbstractMsgHandler> STRATEGY_MAP = new HashMap<>();

    public static void register(Integer code, AbstractMsgHandler strategy) {
        STRATEGY_MAP.put(code, strategy);
    }

    public static AbstractMsgHandler getStrategyNoNull(Integer code) {
        AbstractMsgHandler strategy = STRATEGY_MAP.get(code);
        return strategy;
    }
}
