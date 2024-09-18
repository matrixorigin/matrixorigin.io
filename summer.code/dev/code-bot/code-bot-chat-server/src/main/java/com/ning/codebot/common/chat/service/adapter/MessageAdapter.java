package com.ning.codebot.common.chat.service.adapter;

import com.ning.codebot.common.chat.domain.entity.Message;
import com.ning.codebot.common.chat.domain.vo.request.ChatMessageReq;

public class MessageAdapter {

    public static Message buildMsgSave(ChatMessageReq request, Long uid, String content) {

        return Message.builder()
                .fromUid(uid)
                .roomId(request.getRoomId())
                .content(content)
                .build();

    }
}
