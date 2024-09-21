package com.ning.codebot.common.user.service;

import com.ning.codebot.common.user.domain.dto.GithubUserInfo;

public interface Outh2Service {
    public String getRedirectUrl(Integer state);
    public void storeUserInfo(GithubUserInfo userInfo);
    public void storeValidCode(String code, String userNmame);
    public String validCode(String code);
}
