package com.ning.chatbot.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;

import lombok.*;

/**
 * <p>
 * User Table
 * </p>
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("user")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * User id
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * User name
     */
    @TableField("name")
    private String name;

    /**
     * User avatar
     */
    @TableField("avatar")
    private String avatar;

    /**
     * Github's open id
     */
    @TableField("open_id")
    private String openId;

    /**
     * Create time
     */
    @TableField("create_time")
    private Date createTime;

    /**
     * Modify time
     */
    @TableField("update_time")
    private Date updateTime;


}