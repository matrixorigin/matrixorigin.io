package com.ning.chatbot.websocket;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.ChannelPipeline;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpServerCodec;
import io.netty.handler.codec.http.websocketx.WebSocketServerProtocolHandler;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import io.netty.handler.stream.ChunkedWriteHandler;
import io.netty.handler.timeout.IdleStateHandler;
import io.netty.util.NettyRuntime;
import io.netty.util.concurrent.Future;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Slf4j
@Configuration
public class WebsocketServer {
    // Listen at 8090
    public static final int WEB_SOCKET_PORT = 8090;
    // Create EventLoop group
    private final EventLoopGroup bossGroup = new NioEventLoopGroup(1);
    // Decided by how many CPUS one computer get
    private final EventLoopGroup workerGroup = new NioEventLoopGroup(NettyRuntime.availableProcessors());

    /**
     * Start websocket server
     */
    @PostConstruct
    public void start() throws InterruptedException {
        // After init the bean, exec this method
        run();
    }

    /**
     * Release resources
     */
    @PreDestroy
    public void destroy() {
        Future<?> future_boss = bossGroup.shutdownGracefully();
        Future<?> future_worker = workerGroup.shutdownGracefully();
        future_worker.syncUninterruptibly();
        future_boss.syncUninterruptibly();
        log.info("close webSoc server success");
    }

    public void run() throws InterruptedException {
        ServerBootstrap serverBootstrap = new ServerBootstrap();
        serverBootstrap.group(bossGroup, workerGroup)
                .channel(NioServerSocketChannel.class)
                .option(ChannelOption.SO_BACKLOG, 128)
                .option(ChannelOption.SO_KEEPALIVE, true)
                .handler(new LoggingHandler(LogLevel.INFO)) // add log for bossGroup
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    @Override
                    protected void initChannel(SocketChannel socketChannel) throws Exception {
                        ChannelPipeline pipeline = socketChannel.pipeline();
                        // Close the connection if the client do not send heart break to the server
                        pipeline.addLast(new IdleStateHandler(30, 0, 0));
                        pipeline.addLast(new HttpServerCodec());
                        // Chunk writer
                        pipeline.addLast(new ChunkedWriteHandler());
                        // Aggregate each segment from http
                        pipeline.addLast(new HttpObjectAggregator(8192));
                        // Websocket handler
                        pipeline.addLast(new WebSocketServerProtocolHandler("/"));
                        // My own handler
                        pipeline.addLast(new WebsocketServerHandler());
                    }
                });
        // Start the server
        serverBootstrap.bind(WEB_SOCKET_PORT).sync();
    }

}