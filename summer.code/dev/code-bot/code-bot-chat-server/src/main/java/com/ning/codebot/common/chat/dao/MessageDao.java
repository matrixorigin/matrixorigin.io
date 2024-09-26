package com.ning.codebot.common.chat.dao;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ning.codebot.common.chat.domain.entity.Message;
import com.ning.codebot.common.chat.mapper.MessageMapper;
import org.springframework.stereotype.Service;

/*
 * store chat message
 */
@Service
public class MessageDao extends ServiceImpl<MessageMapper, Message> {
}
