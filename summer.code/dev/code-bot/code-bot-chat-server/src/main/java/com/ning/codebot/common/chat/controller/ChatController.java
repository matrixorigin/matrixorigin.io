package com.ning.codebot.common.chat.controller;

import com.ning.codebot.common.chat.domain.vo.request.ChatMessageReq;
import com.ning.codebot.common.chat.domain.vo.response.ChatMessageResp;
import com.ning.codebot.common.chat.service.ChatService;
import com.ning.codebot.common.common.utils.RequestHolder;
import com.ning.codebot.common.domain.dto.RequestInfo;
import com.ning.codebot.common.domain.vo.response.ApiResult;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

/**
 * <p>
 * chat interface
 * </p>
 */
@RestController
@RequestMapping("codebot/chat")
@Api(tags = "The interface for chat service")
@Slf4j
public class ChatController {
    @Autowired
    private ChatService chatService;

    @PostMapping("/msg")
    @ApiOperation("Send meesage")
    public ApiResult<ChatMessageResp> sendMsg(@Valid @RequestBody ChatMessageReq request) {
        RequestHolder.set(new RequestInfo(123L));
        // System.out.println(RequestHolder.get().getUid());
        Long msgId = chatService.sendMsg(request, RequestHolder.get().getUid());
        return ApiResult.success(ChatMessageResp.builder().messageId(msgId).build());
    }

}
