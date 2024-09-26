package com.ning.codebot.common.user.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import java.time.LocalDateTime;
import com.baomidou.mybatisplus.annotation.TableField;
import java.io.Serializable;
import java.util.Date;

import lombok.*;


@Data
@EqualsAndHashCode(callSuper = false)
@TableName("user")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * user id
     */
      @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * user name
     */
    @TableField("name")
    private String name;

    /**
     * user avatar
     */
    @TableField("avatar")
    private String avatar;

    /**
     * github node id
     */
    @TableField("node_id")
    private String nodeId;

    /**
     * user status: 1 online 2 offline
     */
    @TableField("active_status")
    private Integer activeStatus;

    /**
     * create time
     */
    @TableField("create_time")
    private Date createTime;

    /**
     * update time
     */
    @TableField("update_time")
    private Date updateTime;


}
