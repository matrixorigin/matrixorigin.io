package com.ning.codebot.common.chat.service.strategy.msg;
import cn.hutool.core.bean.BeanUtil;
import com.ning.codebot.common.chat.dao.MessageDao;
import com.ning.codebot.common.chat.domain.entity.Message;
import com.ning.codebot.common.chat.domain.enums.MessageTypeEnum;
import com.ning.codebot.common.chat.domain.vo.request.ChatMessageReq;
import com.ning.codebot.common.chat.service.adapter.MessageAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.lang.reflect.ParameterizedType;

/*
 * The handler for the message
 */
@Service
public abstract class AbstractMsgHandler<Req> {

    @Autowired
    private MessageDao messageDao;
    private Integer type;
    @PostConstruct
    private void init() {
        // register in the factory
        MsgHandlerFactory.register(this.type, this);
    }

    abstract MessageTypeEnum getMsgTypeEnum();

    @Transactional
    public Long checkAndSaveMsg(ChatMessageReq request, Long uid) {
        String content = request.getContent();
        // check
        checkMsg(content, request.getRoomId(), uid);
        // convert to insert data
        Message insert = MessageAdapter.buildMsgSave(request, uid, convertToRowData(content));
        // save to the db
        messageDao.save(insert);
        return insert.getId();
    }
    protected abstract void checkMsg(String content, String roomId, Long uid);
    protected abstract String convertToRowData(String content);
}
