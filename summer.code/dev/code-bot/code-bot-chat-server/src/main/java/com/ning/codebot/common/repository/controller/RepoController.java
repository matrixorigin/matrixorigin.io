package com.ning.codebot.common.repository.controller;

import com.ning.codebot.common.common.annotation.RedissonLock;
import com.ning.codebot.common.domain.vo.response.ApiResult;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("codebot/reporsitory")
public class RepoController {
    @PostMapping("/subscribe")
    @RedissonLock(key = "#subscribe")
    public ApiResult<Void> subscribe(@RequestBody String author, @RequestBody String repoName){
        //TODO: finish the check logic to avoid multiple times download
        return new ApiResult<>();
    }
}
