package com.ning.chatbot;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.generator.AutoGenerator;
import com.baomidou.mybatisplus.generator.config.DataSourceConfig;
import com.baomidou.mybatisplus.generator.config.GlobalConfig;
import com.baomidou.mybatisplus.generator.config.PackageConfig;
import com.baomidou.mybatisplus.generator.config.StrategyConfig;
import com.baomidou.mybatisplus.generator.config.po.TableFill;
import com.baomidou.mybatisplus.generator.config.rules.NamingStrategy;

import java.util.ArrayList;
import java.util.List;

// Used to generate DAO, MAPPER and so on
public class MPGenerator {
    public static void main(String[] args) {
        // Auto Generator
        AutoGenerator autoGenerator = new AutoGenerator();

        // Data Source
        DataSourceConfig dataSourceConfig = new DataSourceConfig();
        dataSourceConfig.setDbType(DbType.MYSQL);
        assembleDev(dataSourceConfig);
        autoGenerator.setDataSource(dataSourceConfig);

        // Global configuration
        GlobalConfig globalConfig = new GlobalConfig();
        globalConfig.setOpen(false);

        globalConfig.setOutputDir(System.getProperty("user.dir") + "/chat-server/src/main/java");
        // Author Name
        globalConfig.setAuthor("<a href=\"https://github.com/addw1\">ning</a>");

        globalConfig.setServiceImplName("%sDao");
        autoGenerator.setGlobalConfig(globalConfig);

        //Package
        PackageConfig packageConfig = new PackageConfig();
        packageConfig.setParent("com.ning.chatbot.common.user");//自定义包的路径
        packageConfig.setEntity("domain.entity");
        packageConfig.setMapper("mapper");
        packageConfig.setController("controller");
        packageConfig.setServiceImpl("dao");
        autoGenerator.setPackageInfo(packageConfig);

        // Config Strategy
        StrategyConfig strategyConfig = new StrategyConfig();
        // Use Lombok
        strategyConfig.setEntityLombokModel(true);
        // Package, Column name
        strategyConfig.setNaming(NamingStrategy.underline_to_camel);
        strategyConfig.setColumnNaming(NamingStrategy.underline_to_camel);
        strategyConfig.setEntityTableFieldAnnotationEnable(true);
        // choose table
        strategyConfig.setInclude(
                "user"
        );

        List<TableFill> list = new ArrayList<TableFill>();
        TableFill tableFill1 = new TableFill("create_time", FieldFill.INSERT);
        TableFill tableFill2 = new TableFill("update_time", FieldFill.INSERT_UPDATE);
        list.add(tableFill1);
        list.add(tableFill2);

//        strategyConfig.setTableFillList(list);
        autoGenerator.setStrategy(strategyConfig);

        autoGenerator.execute();

    }
    // Connect to the mysql
    public static void assembleDev(DataSourceConfig dataSourceConfig) {
        dataSourceConfig.setDriverName("com.mysql.cj.jdbc.Driver");
        dataSourceConfig.setUsername("root");
        dataSourceConfig.setPassword("");
        dataSourceConfig.setUrl("jdbc:mysql://localhost:3306/user?useUnicode=true&characterEncoding=utf-8&useSSL=true&serverTimezone=UTC");
    }
}
