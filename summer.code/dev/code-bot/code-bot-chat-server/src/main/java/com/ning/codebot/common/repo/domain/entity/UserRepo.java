package com.ning.codebot.common.repo.domain.entity;


import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.util.Date;

@Data
@EqualsAndHashCode(callSuper = false)
@TableName(value = "messages", autoResultMap = true)
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRepo {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableId(value = "user_name")
    private String userName;

    @TableId(value = "repo_name")
    private String repoName;

    // 0: building 1: finish 2: fail
    @TableId(value = "status")
    private Integer status;

     // create time
    @TableField("create_time")
    private Date createTime;

}
