package com.ning.codebot.common.repo.domain;

import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RepoUploadReq {
    @NotNull
    @ApiModelProperty("User name")
    private String userName;
    @NotNull
    @ApiModelProperty("Repo name")
    private String repoName;

}