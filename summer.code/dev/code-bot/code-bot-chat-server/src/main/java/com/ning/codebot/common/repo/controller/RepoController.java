package com.ning.codebot.common.repo.controller;

import com.ning.codebot.common.chat.domain.vo.response.ChatMessageResp;
import com.ning.codebot.common.client.LLMClient;
import com.ning.codebot.common.common.utils.RequestHolder;
import com.ning.codebot.common.domain.vo.response.ApiResult;
import com.ning.codebot.common.repo.domain.RepoUploadReq;
import com.ning.codebot.common.repo.service.RepoService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;

@RestController
@RequestMapping("codebot/repo")
@Api(tags = "The interface for chat service")
@Slf4j
public class RepoController {
    @Autowired
    LLMClient llmClient;
    @Autowired
    RepoService repoService;

    @PostMapping("/upload")
    @ApiOperation("subscribe the repository")
    public ApiResult<ChatMessageResp> sendMsg(@Valid @RequestBody RepoUploadReq request) {
        // store in DB
        repoService.storeRepo(request.getUserName(), request.getRepoName());
        if (llmClient.subscribeRepo(request.getRepoName(), request.getUserName())){
            return ApiResult.success();
        }else{
            return ApiResult.fail(1, "fail subscribe the repository");
        }
    }

}