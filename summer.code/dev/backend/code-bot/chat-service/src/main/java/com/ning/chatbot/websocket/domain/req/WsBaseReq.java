package com.ning.chatbot.websocket.domain.req;
import lombok.Data;
@Data
public class WsBaseReq {
    private Integer type;
    private String data;
}