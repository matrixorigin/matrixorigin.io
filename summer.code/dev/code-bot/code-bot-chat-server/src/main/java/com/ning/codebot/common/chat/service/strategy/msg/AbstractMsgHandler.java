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
    private Class<Req> bodyClass;
    @PostConstruct
    private void init() {
        ParameterizedType genericSuperclass = (ParameterizedType) this.getClass().getGenericSuperclass();
        this.bodyClass = (Class<Req>) genericSuperclass.getActualTypeArguments()[0];
        // register in the factory
        MsgHandlerFactory.register(getMsgTypeEnum().getType(), this);
    }

    abstract MessageTypeEnum getMsgTypeEnum();

    @Transactional
    public Long checkAndSaveMsg(ChatMessageReq request, Long uid) {
        Req body = this.toBean(request.getBody());
        // check
        checkMsg(body, request.getRoomId(), uid);
        // convert to insert data
        Message insert = MessageAdapter.buildMsgSave(request, uid);
        // save to the db
        messageDao.save(insert);

        return insert.getId();
    }
    // Change message body to bean
    private Req toBean(Object body) {
        if (bodyClass.isAssignableFrom(body.getClass())) {
            return (Req) body;
        }
        return BeanUtil.toBean(body, bodyClass);
    }

    protected abstract void checkMsg(Req body, Long roomId, Long uid);
}
