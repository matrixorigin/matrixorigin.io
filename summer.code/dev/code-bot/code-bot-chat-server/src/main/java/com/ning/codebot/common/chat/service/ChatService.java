package com.ning.codebot.common.chat.service;

import com.ning.codebot.common.chat.domain.vo.request.ChatMessageReq;
import com.ning.codebot.common.chat.domain.vo.response.ChatMessageResp;

/**
 *  handle chat messages
 */

public interface ChatService {
    /**
     * Send message
     * @param request
     */
    Long sendMsg(ChatMessageReq request, Long uid);

}
