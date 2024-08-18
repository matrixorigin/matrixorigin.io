package com.ning.codebot.common.chat.service.impl;

import com.ning.codebot.common.chat.dao.MessageDao;
import com.ning.codebot.common.chat.domain.entity.Message;
import com.ning.codebot.common.chat.domain.vo.request.ChatMessageReq;
import com.ning.codebot.common.chat.domain.vo.response.ChatMessageResp;
import com.ning.codebot.common.chat.service.ChatService;
import com.ning.codebot.common.chat.service.strategy.msg.AbstractMsgHandler;
import com.ning.codebot.common.chat.service.strategy.msg.MsgHandlerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatServiceImpl implements ChatService {
    @Autowired
    MessageDao messageDao;
    @Override
    @Transactional
    public Long sendMsg(ChatMessageReq request, Long uid){
        AbstractMsgHandler<?> msgHandler = MsgHandlerFactory.getStrategyNoNull(request.getMsgType());
        Long msgId = msgHandler.checkAndSaveMsg(request, uid);
        // send to mq
        return msgId;
    }

}
