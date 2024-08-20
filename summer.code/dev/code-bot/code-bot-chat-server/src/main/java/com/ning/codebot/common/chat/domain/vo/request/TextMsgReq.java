package com.ning.codebot.common.chat.domain.vo.request;

import io.swagger.annotations.ApiModelProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TextMsgReq {

    @NotBlank(message = "Cannot send an empty message")
    @Size(max = 1024, message = "The length of messages cannot over 1024")
    @ApiModelProperty("Message Content")
    private String content;

}
