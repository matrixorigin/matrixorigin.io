package com.ning.chatbot.websocket;

import cn.hutool.json.JSONUtil;
import com.ning.chatbot.websocket.domain.enums.WsReqType;
import com.ning.chatbot.websocket.domain.req.WsBaseReq;
import io.netty.channel.ChannelHandlerContext;
import io.netty.channel.SimpleChannelInboundHandler;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;
import io.netty.handler.timeout.IdleState;
import io.netty.handler.timeout.IdleStateEvent;




public class WebsocketServerHandler extends SimpleChannelInboundHandler<TextWebSocketFrame> {

    @Override
    public void userEventTriggered(ChannelHandlerContext ctx, Object evt) throws Exception {
        if(evt instanceof WebSocketServerProtocolHandler.HandshakeComplete){
            System.out.println("shark hand");
        }else if(evt instanceof IdleStateEvent){
            IdleStateEvent event = (IdleStateEvent)evt;
            if(event.state()== IdleState.READER_IDLE){
                System.out.println("read idea");
                ctx.channel().close();
            }
        }
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx, TextWebSocketFrame msg) throws Exception {
        // Converted the json text to bean(Referenced WsBaseReq.class)
        switch (WsReqType.of(JSONUtil.toBean(msg.text(), WsBaseReq.class).getType())) {
            case AUTHORIZE:
                break;
            case HEARTBEAT:
                break;
            case REGISTER:
                System.out.println("register");
                ctx.channel().writeAndFlush(new TextWebSocketFrame("xxx"));
        }
    }
}
