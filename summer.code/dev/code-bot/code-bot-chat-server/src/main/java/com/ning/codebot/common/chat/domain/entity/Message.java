package com.ning.codebot.common.chat.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.*;

import java.io.Serializable;
import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName(value = "messages", autoResultMap = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Message implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * id
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * room id
     */
    @TableField("room_id")
    private Long roomId;

    /**
     * from uid
     */
    @TableField("from_uid")
    private Long fromUid;

    /**
     * the content of messages
     */
    @TableField("content")
    private String content;
    
    /**
     * create time
     */
    @TableField("create_time")
    private Date createTime;


}

