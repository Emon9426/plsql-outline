-- =============================================================================
-- 用例: Package Spec / 长代码(简单结构) (package_spec/pkg_spec_long.pks)
-- 本文件由 ZCodeTest/generate-long.js 确定性生成(10,000+ 行), 请勿手工编辑;
-- 再生: node ZCodeTest/generate-long.js
-- 覆盖: 约千名成员声明(函数/过程交替, 多行签名)
-- 覆盖: 常量/异常/类型/游标
-- 覆盖: 包规格只有声明: 不含 Exception 段与子程序体
-- =============================================================================
CREATE OR REPLACE PACKAGE pkg_long_api IS

    c_version   CONSTANT VARCHAR2(20) := '3.0.0';
    c_max_rows  CONSTANT NUMBER := 1000000;

    e_not_found  EXCEPTION;
    e_forbidden  EXCEPTION;

    TYPE t_key_rec IS RECORD (
        owner  VARCHAR2(30),
        key    NUMBER
    );
    TYPE t_key_tab IS TABLE OF t_key_rec INDEX BY PLS_INTEGER;

    CURSOR c_all_keys IS
        SELECT owner, key
          FROM zc_key_tab;

    -- [0001] 查询类接口
    FUNCTION get_metric_0001(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0001] 维护类接口
    PROCEDURE set_metric_0001(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0002] 查询类接口
    FUNCTION get_metric_0002(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0002] 维护类接口
    PROCEDURE set_metric_0002(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0003] 查询类接口
    FUNCTION get_metric_0003(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0003] 维护类接口
    PROCEDURE set_metric_0003(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0004] 查询类接口
    FUNCTION get_metric_0004(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0004] 维护类接口
    PROCEDURE set_metric_0004(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0005] 查询类接口
    FUNCTION get_metric_0005(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0005] 维护类接口
    PROCEDURE set_metric_0005(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0006] 查询类接口
    FUNCTION get_metric_0006(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0006] 维护类接口
    PROCEDURE set_metric_0006(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0007] 查询类接口
    FUNCTION get_metric_0007(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0007] 维护类接口
    PROCEDURE set_metric_0007(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0008] 查询类接口
    FUNCTION get_metric_0008(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0008] 维护类接口
    PROCEDURE set_metric_0008(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0009] 查询类接口
    FUNCTION get_metric_0009(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0009] 维护类接口
    PROCEDURE set_metric_0009(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0010] 查询类接口
    FUNCTION get_metric_0010(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0010] 维护类接口
    PROCEDURE set_metric_0010(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0011] 查询类接口
    FUNCTION get_metric_0011(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0011] 维护类接口
    PROCEDURE set_metric_0011(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0012] 查询类接口
    FUNCTION get_metric_0012(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0012] 维护类接口
    PROCEDURE set_metric_0012(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0013] 查询类接口
    FUNCTION get_metric_0013(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0013] 维护类接口
    PROCEDURE set_metric_0013(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0014] 查询类接口
    FUNCTION get_metric_0014(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0014] 维护类接口
    PROCEDURE set_metric_0014(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0015] 查询类接口
    FUNCTION get_metric_0015(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0015] 维护类接口
    PROCEDURE set_metric_0015(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0016] 查询类接口
    FUNCTION get_metric_0016(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0016] 维护类接口
    PROCEDURE set_metric_0016(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0017] 查询类接口
    FUNCTION get_metric_0017(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0017] 维护类接口
    PROCEDURE set_metric_0017(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0018] 查询类接口
    FUNCTION get_metric_0018(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0018] 维护类接口
    PROCEDURE set_metric_0018(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0019] 查询类接口
    FUNCTION get_metric_0019(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0019] 维护类接口
    PROCEDURE set_metric_0019(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0020] 查询类接口
    FUNCTION get_metric_0020(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0020] 维护类接口
    PROCEDURE set_metric_0020(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0021] 查询类接口
    FUNCTION get_metric_0021(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0021] 维护类接口
    PROCEDURE set_metric_0021(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0022] 查询类接口
    FUNCTION get_metric_0022(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0022] 维护类接口
    PROCEDURE set_metric_0022(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0023] 查询类接口
    FUNCTION get_metric_0023(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0023] 维护类接口
    PROCEDURE set_metric_0023(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0024] 查询类接口
    FUNCTION get_metric_0024(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0024] 维护类接口
    PROCEDURE set_metric_0024(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0025] 查询类接口
    FUNCTION get_metric_0025(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0025] 维护类接口
    PROCEDURE set_metric_0025(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0026] 查询类接口
    FUNCTION get_metric_0026(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0026] 维护类接口
    PROCEDURE set_metric_0026(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0027] 查询类接口
    FUNCTION get_metric_0027(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0027] 维护类接口
    PROCEDURE set_metric_0027(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0028] 查询类接口
    FUNCTION get_metric_0028(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0028] 维护类接口
    PROCEDURE set_metric_0028(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0029] 查询类接口
    FUNCTION get_metric_0029(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0029] 维护类接口
    PROCEDURE set_metric_0029(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0030] 查询类接口
    FUNCTION get_metric_0030(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0030] 维护类接口
    PROCEDURE set_metric_0030(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0031] 查询类接口
    FUNCTION get_metric_0031(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0031] 维护类接口
    PROCEDURE set_metric_0031(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0032] 查询类接口
    FUNCTION get_metric_0032(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0032] 维护类接口
    PROCEDURE set_metric_0032(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0033] 查询类接口
    FUNCTION get_metric_0033(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0033] 维护类接口
    PROCEDURE set_metric_0033(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0034] 查询类接口
    FUNCTION get_metric_0034(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0034] 维护类接口
    PROCEDURE set_metric_0034(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0035] 查询类接口
    FUNCTION get_metric_0035(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0035] 维护类接口
    PROCEDURE set_metric_0035(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0036] 查询类接口
    FUNCTION get_metric_0036(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0036] 维护类接口
    PROCEDURE set_metric_0036(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0037] 查询类接口
    FUNCTION get_metric_0037(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0037] 维护类接口
    PROCEDURE set_metric_0037(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0038] 查询类接口
    FUNCTION get_metric_0038(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0038] 维护类接口
    PROCEDURE set_metric_0038(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0039] 查询类接口
    FUNCTION get_metric_0039(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0039] 维护类接口
    PROCEDURE set_metric_0039(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0040] 查询类接口
    FUNCTION get_metric_0040(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0040] 维护类接口
    PROCEDURE set_metric_0040(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0041] 查询类接口
    FUNCTION get_metric_0041(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0041] 维护类接口
    PROCEDURE set_metric_0041(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0042] 查询类接口
    FUNCTION get_metric_0042(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0042] 维护类接口
    PROCEDURE set_metric_0042(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0043] 查询类接口
    FUNCTION get_metric_0043(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0043] 维护类接口
    PROCEDURE set_metric_0043(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0044] 查询类接口
    FUNCTION get_metric_0044(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0044] 维护类接口
    PROCEDURE set_metric_0044(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0045] 查询类接口
    FUNCTION get_metric_0045(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0045] 维护类接口
    PROCEDURE set_metric_0045(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0046] 查询类接口
    FUNCTION get_metric_0046(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0046] 维护类接口
    PROCEDURE set_metric_0046(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0047] 查询类接口
    FUNCTION get_metric_0047(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0047] 维护类接口
    PROCEDURE set_metric_0047(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0048] 查询类接口
    FUNCTION get_metric_0048(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0048] 维护类接口
    PROCEDURE set_metric_0048(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0049] 查询类接口
    FUNCTION get_metric_0049(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0049] 维护类接口
    PROCEDURE set_metric_0049(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0050] 查询类接口
    FUNCTION get_metric_0050(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0050] 维护类接口
    PROCEDURE set_metric_0050(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0051] 查询类接口
    FUNCTION get_metric_0051(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0051] 维护类接口
    PROCEDURE set_metric_0051(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0052] 查询类接口
    FUNCTION get_metric_0052(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0052] 维护类接口
    PROCEDURE set_metric_0052(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0053] 查询类接口
    FUNCTION get_metric_0053(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0053] 维护类接口
    PROCEDURE set_metric_0053(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0054] 查询类接口
    FUNCTION get_metric_0054(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0054] 维护类接口
    PROCEDURE set_metric_0054(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0055] 查询类接口
    FUNCTION get_metric_0055(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0055] 维护类接口
    PROCEDURE set_metric_0055(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0056] 查询类接口
    FUNCTION get_metric_0056(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0056] 维护类接口
    PROCEDURE set_metric_0056(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0057] 查询类接口
    FUNCTION get_metric_0057(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0057] 维护类接口
    PROCEDURE set_metric_0057(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0058] 查询类接口
    FUNCTION get_metric_0058(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0058] 维护类接口
    PROCEDURE set_metric_0058(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0059] 查询类接口
    FUNCTION get_metric_0059(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0059] 维护类接口
    PROCEDURE set_metric_0059(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0060] 查询类接口
    FUNCTION get_metric_0060(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0060] 维护类接口
    PROCEDURE set_metric_0060(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0061] 查询类接口
    FUNCTION get_metric_0061(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0061] 维护类接口
    PROCEDURE set_metric_0061(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0062] 查询类接口
    FUNCTION get_metric_0062(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0062] 维护类接口
    PROCEDURE set_metric_0062(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0063] 查询类接口
    FUNCTION get_metric_0063(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0063] 维护类接口
    PROCEDURE set_metric_0063(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0064] 查询类接口
    FUNCTION get_metric_0064(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0064] 维护类接口
    PROCEDURE set_metric_0064(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0065] 查询类接口
    FUNCTION get_metric_0065(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0065] 维护类接口
    PROCEDURE set_metric_0065(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0066] 查询类接口
    FUNCTION get_metric_0066(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0066] 维护类接口
    PROCEDURE set_metric_0066(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0067] 查询类接口
    FUNCTION get_metric_0067(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0067] 维护类接口
    PROCEDURE set_metric_0067(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0068] 查询类接口
    FUNCTION get_metric_0068(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0068] 维护类接口
    PROCEDURE set_metric_0068(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0069] 查询类接口
    FUNCTION get_metric_0069(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0069] 维护类接口
    PROCEDURE set_metric_0069(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0070] 查询类接口
    FUNCTION get_metric_0070(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0070] 维护类接口
    PROCEDURE set_metric_0070(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0071] 查询类接口
    FUNCTION get_metric_0071(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0071] 维护类接口
    PROCEDURE set_metric_0071(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0072] 查询类接口
    FUNCTION get_metric_0072(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0072] 维护类接口
    PROCEDURE set_metric_0072(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0073] 查询类接口
    FUNCTION get_metric_0073(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0073] 维护类接口
    PROCEDURE set_metric_0073(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0074] 查询类接口
    FUNCTION get_metric_0074(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0074] 维护类接口
    PROCEDURE set_metric_0074(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0075] 查询类接口
    FUNCTION get_metric_0075(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0075] 维护类接口
    PROCEDURE set_metric_0075(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0076] 查询类接口
    FUNCTION get_metric_0076(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0076] 维护类接口
    PROCEDURE set_metric_0076(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0077] 查询类接口
    FUNCTION get_metric_0077(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0077] 维护类接口
    PROCEDURE set_metric_0077(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0078] 查询类接口
    FUNCTION get_metric_0078(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0078] 维护类接口
    PROCEDURE set_metric_0078(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0079] 查询类接口
    FUNCTION get_metric_0079(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0079] 维护类接口
    PROCEDURE set_metric_0079(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0080] 查询类接口
    FUNCTION get_metric_0080(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0080] 维护类接口
    PROCEDURE set_metric_0080(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0081] 查询类接口
    FUNCTION get_metric_0081(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0081] 维护类接口
    PROCEDURE set_metric_0081(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0082] 查询类接口
    FUNCTION get_metric_0082(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0082] 维护类接口
    PROCEDURE set_metric_0082(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0083] 查询类接口
    FUNCTION get_metric_0083(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0083] 维护类接口
    PROCEDURE set_metric_0083(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0084] 查询类接口
    FUNCTION get_metric_0084(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0084] 维护类接口
    PROCEDURE set_metric_0084(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0085] 查询类接口
    FUNCTION get_metric_0085(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0085] 维护类接口
    PROCEDURE set_metric_0085(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0086] 查询类接口
    FUNCTION get_metric_0086(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0086] 维护类接口
    PROCEDURE set_metric_0086(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0087] 查询类接口
    FUNCTION get_metric_0087(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0087] 维护类接口
    PROCEDURE set_metric_0087(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0088] 查询类接口
    FUNCTION get_metric_0088(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0088] 维护类接口
    PROCEDURE set_metric_0088(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0089] 查询类接口
    FUNCTION get_metric_0089(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0089] 维护类接口
    PROCEDURE set_metric_0089(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0090] 查询类接口
    FUNCTION get_metric_0090(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0090] 维护类接口
    PROCEDURE set_metric_0090(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0091] 查询类接口
    FUNCTION get_metric_0091(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0091] 维护类接口
    PROCEDURE set_metric_0091(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0092] 查询类接口
    FUNCTION get_metric_0092(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0092] 维护类接口
    PROCEDURE set_metric_0092(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0093] 查询类接口
    FUNCTION get_metric_0093(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0093] 维护类接口
    PROCEDURE set_metric_0093(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0094] 查询类接口
    FUNCTION get_metric_0094(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0094] 维护类接口
    PROCEDURE set_metric_0094(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0095] 查询类接口
    FUNCTION get_metric_0095(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0095] 维护类接口
    PROCEDURE set_metric_0095(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0096] 查询类接口
    FUNCTION get_metric_0096(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0096] 维护类接口
    PROCEDURE set_metric_0096(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0097] 查询类接口
    FUNCTION get_metric_0097(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0097] 维护类接口
    PROCEDURE set_metric_0097(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0098] 查询类接口
    FUNCTION get_metric_0098(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0098] 维护类接口
    PROCEDURE set_metric_0098(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0099] 查询类接口
    FUNCTION get_metric_0099(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0099] 维护类接口
    PROCEDURE set_metric_0099(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0100] 查询类接口
    FUNCTION get_metric_0100(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0100] 维护类接口
    PROCEDURE set_metric_0100(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0101] 查询类接口
    FUNCTION get_metric_0101(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0101] 维护类接口
    PROCEDURE set_metric_0101(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0102] 查询类接口
    FUNCTION get_metric_0102(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0102] 维护类接口
    PROCEDURE set_metric_0102(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0103] 查询类接口
    FUNCTION get_metric_0103(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0103] 维护类接口
    PROCEDURE set_metric_0103(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0104] 查询类接口
    FUNCTION get_metric_0104(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0104] 维护类接口
    PROCEDURE set_metric_0104(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0105] 查询类接口
    FUNCTION get_metric_0105(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0105] 维护类接口
    PROCEDURE set_metric_0105(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0106] 查询类接口
    FUNCTION get_metric_0106(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0106] 维护类接口
    PROCEDURE set_metric_0106(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0107] 查询类接口
    FUNCTION get_metric_0107(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0107] 维护类接口
    PROCEDURE set_metric_0107(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0108] 查询类接口
    FUNCTION get_metric_0108(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0108] 维护类接口
    PROCEDURE set_metric_0108(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0109] 查询类接口
    FUNCTION get_metric_0109(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0109] 维护类接口
    PROCEDURE set_metric_0109(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0110] 查询类接口
    FUNCTION get_metric_0110(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0110] 维护类接口
    PROCEDURE set_metric_0110(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0111] 查询类接口
    FUNCTION get_metric_0111(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0111] 维护类接口
    PROCEDURE set_metric_0111(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0112] 查询类接口
    FUNCTION get_metric_0112(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0112] 维护类接口
    PROCEDURE set_metric_0112(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0113] 查询类接口
    FUNCTION get_metric_0113(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0113] 维护类接口
    PROCEDURE set_metric_0113(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0114] 查询类接口
    FUNCTION get_metric_0114(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0114] 维护类接口
    PROCEDURE set_metric_0114(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0115] 查询类接口
    FUNCTION get_metric_0115(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0115] 维护类接口
    PROCEDURE set_metric_0115(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0116] 查询类接口
    FUNCTION get_metric_0116(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0116] 维护类接口
    PROCEDURE set_metric_0116(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0117] 查询类接口
    FUNCTION get_metric_0117(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0117] 维护类接口
    PROCEDURE set_metric_0117(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0118] 查询类接口
    FUNCTION get_metric_0118(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0118] 维护类接口
    PROCEDURE set_metric_0118(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0119] 查询类接口
    FUNCTION get_metric_0119(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0119] 维护类接口
    PROCEDURE set_metric_0119(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0120] 查询类接口
    FUNCTION get_metric_0120(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0120] 维护类接口
    PROCEDURE set_metric_0120(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0121] 查询类接口
    FUNCTION get_metric_0121(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0121] 维护类接口
    PROCEDURE set_metric_0121(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0122] 查询类接口
    FUNCTION get_metric_0122(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0122] 维护类接口
    PROCEDURE set_metric_0122(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0123] 查询类接口
    FUNCTION get_metric_0123(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0123] 维护类接口
    PROCEDURE set_metric_0123(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0124] 查询类接口
    FUNCTION get_metric_0124(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0124] 维护类接口
    PROCEDURE set_metric_0124(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0125] 查询类接口
    FUNCTION get_metric_0125(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0125] 维护类接口
    PROCEDURE set_metric_0125(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0126] 查询类接口
    FUNCTION get_metric_0126(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0126] 维护类接口
    PROCEDURE set_metric_0126(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0127] 查询类接口
    FUNCTION get_metric_0127(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0127] 维护类接口
    PROCEDURE set_metric_0127(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0128] 查询类接口
    FUNCTION get_metric_0128(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0128] 维护类接口
    PROCEDURE set_metric_0128(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0129] 查询类接口
    FUNCTION get_metric_0129(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0129] 维护类接口
    PROCEDURE set_metric_0129(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0130] 查询类接口
    FUNCTION get_metric_0130(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0130] 维护类接口
    PROCEDURE set_metric_0130(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0131] 查询类接口
    FUNCTION get_metric_0131(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0131] 维护类接口
    PROCEDURE set_metric_0131(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0132] 查询类接口
    FUNCTION get_metric_0132(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0132] 维护类接口
    PROCEDURE set_metric_0132(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0133] 查询类接口
    FUNCTION get_metric_0133(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0133] 维护类接口
    PROCEDURE set_metric_0133(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0134] 查询类接口
    FUNCTION get_metric_0134(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0134] 维护类接口
    PROCEDURE set_metric_0134(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0135] 查询类接口
    FUNCTION get_metric_0135(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0135] 维护类接口
    PROCEDURE set_metric_0135(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0136] 查询类接口
    FUNCTION get_metric_0136(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0136] 维护类接口
    PROCEDURE set_metric_0136(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0137] 查询类接口
    FUNCTION get_metric_0137(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0137] 维护类接口
    PROCEDURE set_metric_0137(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0138] 查询类接口
    FUNCTION get_metric_0138(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0138] 维护类接口
    PROCEDURE set_metric_0138(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0139] 查询类接口
    FUNCTION get_metric_0139(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0139] 维护类接口
    PROCEDURE set_metric_0139(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0140] 查询类接口
    FUNCTION get_metric_0140(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0140] 维护类接口
    PROCEDURE set_metric_0140(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0141] 查询类接口
    FUNCTION get_metric_0141(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0141] 维护类接口
    PROCEDURE set_metric_0141(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0142] 查询类接口
    FUNCTION get_metric_0142(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0142] 维护类接口
    PROCEDURE set_metric_0142(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0143] 查询类接口
    FUNCTION get_metric_0143(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0143] 维护类接口
    PROCEDURE set_metric_0143(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0144] 查询类接口
    FUNCTION get_metric_0144(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0144] 维护类接口
    PROCEDURE set_metric_0144(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0145] 查询类接口
    FUNCTION get_metric_0145(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0145] 维护类接口
    PROCEDURE set_metric_0145(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0146] 查询类接口
    FUNCTION get_metric_0146(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0146] 维护类接口
    PROCEDURE set_metric_0146(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0147] 查询类接口
    FUNCTION get_metric_0147(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0147] 维护类接口
    PROCEDURE set_metric_0147(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0148] 查询类接口
    FUNCTION get_metric_0148(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0148] 维护类接口
    PROCEDURE set_metric_0148(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0149] 查询类接口
    FUNCTION get_metric_0149(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0149] 维护类接口
    PROCEDURE set_metric_0149(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0150] 查询类接口
    FUNCTION get_metric_0150(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0150] 维护类接口
    PROCEDURE set_metric_0150(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0151] 查询类接口
    FUNCTION get_metric_0151(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0151] 维护类接口
    PROCEDURE set_metric_0151(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0152] 查询类接口
    FUNCTION get_metric_0152(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0152] 维护类接口
    PROCEDURE set_metric_0152(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0153] 查询类接口
    FUNCTION get_metric_0153(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0153] 维护类接口
    PROCEDURE set_metric_0153(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0154] 查询类接口
    FUNCTION get_metric_0154(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0154] 维护类接口
    PROCEDURE set_metric_0154(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0155] 查询类接口
    FUNCTION get_metric_0155(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0155] 维护类接口
    PROCEDURE set_metric_0155(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0156] 查询类接口
    FUNCTION get_metric_0156(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0156] 维护类接口
    PROCEDURE set_metric_0156(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0157] 查询类接口
    FUNCTION get_metric_0157(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0157] 维护类接口
    PROCEDURE set_metric_0157(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0158] 查询类接口
    FUNCTION get_metric_0158(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0158] 维护类接口
    PROCEDURE set_metric_0158(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0159] 查询类接口
    FUNCTION get_metric_0159(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0159] 维护类接口
    PROCEDURE set_metric_0159(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0160] 查询类接口
    FUNCTION get_metric_0160(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0160] 维护类接口
    PROCEDURE set_metric_0160(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0161] 查询类接口
    FUNCTION get_metric_0161(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0161] 维护类接口
    PROCEDURE set_metric_0161(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0162] 查询类接口
    FUNCTION get_metric_0162(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0162] 维护类接口
    PROCEDURE set_metric_0162(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0163] 查询类接口
    FUNCTION get_metric_0163(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0163] 维护类接口
    PROCEDURE set_metric_0163(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0164] 查询类接口
    FUNCTION get_metric_0164(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0164] 维护类接口
    PROCEDURE set_metric_0164(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0165] 查询类接口
    FUNCTION get_metric_0165(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0165] 维护类接口
    PROCEDURE set_metric_0165(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0166] 查询类接口
    FUNCTION get_metric_0166(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0166] 维护类接口
    PROCEDURE set_metric_0166(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0167] 查询类接口
    FUNCTION get_metric_0167(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0167] 维护类接口
    PROCEDURE set_metric_0167(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0168] 查询类接口
    FUNCTION get_metric_0168(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0168] 维护类接口
    PROCEDURE set_metric_0168(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0169] 查询类接口
    FUNCTION get_metric_0169(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0169] 维护类接口
    PROCEDURE set_metric_0169(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0170] 查询类接口
    FUNCTION get_metric_0170(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0170] 维护类接口
    PROCEDURE set_metric_0170(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0171] 查询类接口
    FUNCTION get_metric_0171(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0171] 维护类接口
    PROCEDURE set_metric_0171(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0172] 查询类接口
    FUNCTION get_metric_0172(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0172] 维护类接口
    PROCEDURE set_metric_0172(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0173] 查询类接口
    FUNCTION get_metric_0173(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0173] 维护类接口
    PROCEDURE set_metric_0173(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0174] 查询类接口
    FUNCTION get_metric_0174(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0174] 维护类接口
    PROCEDURE set_metric_0174(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0175] 查询类接口
    FUNCTION get_metric_0175(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0175] 维护类接口
    PROCEDURE set_metric_0175(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0176] 查询类接口
    FUNCTION get_metric_0176(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0176] 维护类接口
    PROCEDURE set_metric_0176(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0177] 查询类接口
    FUNCTION get_metric_0177(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0177] 维护类接口
    PROCEDURE set_metric_0177(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0178] 查询类接口
    FUNCTION get_metric_0178(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0178] 维护类接口
    PROCEDURE set_metric_0178(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0179] 查询类接口
    FUNCTION get_metric_0179(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0179] 维护类接口
    PROCEDURE set_metric_0179(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0180] 查询类接口
    FUNCTION get_metric_0180(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0180] 维护类接口
    PROCEDURE set_metric_0180(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0181] 查询类接口
    FUNCTION get_metric_0181(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0181] 维护类接口
    PROCEDURE set_metric_0181(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0182] 查询类接口
    FUNCTION get_metric_0182(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0182] 维护类接口
    PROCEDURE set_metric_0182(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0183] 查询类接口
    FUNCTION get_metric_0183(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0183] 维护类接口
    PROCEDURE set_metric_0183(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0184] 查询类接口
    FUNCTION get_metric_0184(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0184] 维护类接口
    PROCEDURE set_metric_0184(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0185] 查询类接口
    FUNCTION get_metric_0185(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0185] 维护类接口
    PROCEDURE set_metric_0185(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0186] 查询类接口
    FUNCTION get_metric_0186(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0186] 维护类接口
    PROCEDURE set_metric_0186(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0187] 查询类接口
    FUNCTION get_metric_0187(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0187] 维护类接口
    PROCEDURE set_metric_0187(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0188] 查询类接口
    FUNCTION get_metric_0188(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0188] 维护类接口
    PROCEDURE set_metric_0188(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0189] 查询类接口
    FUNCTION get_metric_0189(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0189] 维护类接口
    PROCEDURE set_metric_0189(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0190] 查询类接口
    FUNCTION get_metric_0190(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0190] 维护类接口
    PROCEDURE set_metric_0190(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0191] 查询类接口
    FUNCTION get_metric_0191(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0191] 维护类接口
    PROCEDURE set_metric_0191(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0192] 查询类接口
    FUNCTION get_metric_0192(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0192] 维护类接口
    PROCEDURE set_metric_0192(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0193] 查询类接口
    FUNCTION get_metric_0193(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0193] 维护类接口
    PROCEDURE set_metric_0193(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0194] 查询类接口
    FUNCTION get_metric_0194(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0194] 维护类接口
    PROCEDURE set_metric_0194(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0195] 查询类接口
    FUNCTION get_metric_0195(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0195] 维护类接口
    PROCEDURE set_metric_0195(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0196] 查询类接口
    FUNCTION get_metric_0196(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0196] 维护类接口
    PROCEDURE set_metric_0196(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0197] 查询类接口
    FUNCTION get_metric_0197(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0197] 维护类接口
    PROCEDURE set_metric_0197(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0198] 查询类接口
    FUNCTION get_metric_0198(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0198] 维护类接口
    PROCEDURE set_metric_0198(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0199] 查询类接口
    FUNCTION get_metric_0199(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0199] 维护类接口
    PROCEDURE set_metric_0199(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0200] 查询类接口
    FUNCTION get_metric_0200(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0200] 维护类接口
    PROCEDURE set_metric_0200(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0201] 查询类接口
    FUNCTION get_metric_0201(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0201] 维护类接口
    PROCEDURE set_metric_0201(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0202] 查询类接口
    FUNCTION get_metric_0202(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0202] 维护类接口
    PROCEDURE set_metric_0202(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0203] 查询类接口
    FUNCTION get_metric_0203(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0203] 维护类接口
    PROCEDURE set_metric_0203(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0204] 查询类接口
    FUNCTION get_metric_0204(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0204] 维护类接口
    PROCEDURE set_metric_0204(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0205] 查询类接口
    FUNCTION get_metric_0205(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0205] 维护类接口
    PROCEDURE set_metric_0205(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0206] 查询类接口
    FUNCTION get_metric_0206(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0206] 维护类接口
    PROCEDURE set_metric_0206(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0207] 查询类接口
    FUNCTION get_metric_0207(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0207] 维护类接口
    PROCEDURE set_metric_0207(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0208] 查询类接口
    FUNCTION get_metric_0208(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0208] 维护类接口
    PROCEDURE set_metric_0208(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0209] 查询类接口
    FUNCTION get_metric_0209(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0209] 维护类接口
    PROCEDURE set_metric_0209(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0210] 查询类接口
    FUNCTION get_metric_0210(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0210] 维护类接口
    PROCEDURE set_metric_0210(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0211] 查询类接口
    FUNCTION get_metric_0211(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0211] 维护类接口
    PROCEDURE set_metric_0211(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0212] 查询类接口
    FUNCTION get_metric_0212(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0212] 维护类接口
    PROCEDURE set_metric_0212(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0213] 查询类接口
    FUNCTION get_metric_0213(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0213] 维护类接口
    PROCEDURE set_metric_0213(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0214] 查询类接口
    FUNCTION get_metric_0214(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0214] 维护类接口
    PROCEDURE set_metric_0214(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0215] 查询类接口
    FUNCTION get_metric_0215(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0215] 维护类接口
    PROCEDURE set_metric_0215(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0216] 查询类接口
    FUNCTION get_metric_0216(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0216] 维护类接口
    PROCEDURE set_metric_0216(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0217] 查询类接口
    FUNCTION get_metric_0217(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0217] 维护类接口
    PROCEDURE set_metric_0217(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0218] 查询类接口
    FUNCTION get_metric_0218(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0218] 维护类接口
    PROCEDURE set_metric_0218(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0219] 查询类接口
    FUNCTION get_metric_0219(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0219] 维护类接口
    PROCEDURE set_metric_0219(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0220] 查询类接口
    FUNCTION get_metric_0220(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0220] 维护类接口
    PROCEDURE set_metric_0220(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0221] 查询类接口
    FUNCTION get_metric_0221(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0221] 维护类接口
    PROCEDURE set_metric_0221(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0222] 查询类接口
    FUNCTION get_metric_0222(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0222] 维护类接口
    PROCEDURE set_metric_0222(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0223] 查询类接口
    FUNCTION get_metric_0223(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0223] 维护类接口
    PROCEDURE set_metric_0223(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0224] 查询类接口
    FUNCTION get_metric_0224(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0224] 维护类接口
    PROCEDURE set_metric_0224(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0225] 查询类接口
    FUNCTION get_metric_0225(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0225] 维护类接口
    PROCEDURE set_metric_0225(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0226] 查询类接口
    FUNCTION get_metric_0226(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0226] 维护类接口
    PROCEDURE set_metric_0226(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0227] 查询类接口
    FUNCTION get_metric_0227(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0227] 维护类接口
    PROCEDURE set_metric_0227(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0228] 查询类接口
    FUNCTION get_metric_0228(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0228] 维护类接口
    PROCEDURE set_metric_0228(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0229] 查询类接口
    FUNCTION get_metric_0229(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0229] 维护类接口
    PROCEDURE set_metric_0229(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0230] 查询类接口
    FUNCTION get_metric_0230(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0230] 维护类接口
    PROCEDURE set_metric_0230(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0231] 查询类接口
    FUNCTION get_metric_0231(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0231] 维护类接口
    PROCEDURE set_metric_0231(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0232] 查询类接口
    FUNCTION get_metric_0232(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0232] 维护类接口
    PROCEDURE set_metric_0232(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0233] 查询类接口
    FUNCTION get_metric_0233(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0233] 维护类接口
    PROCEDURE set_metric_0233(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0234] 查询类接口
    FUNCTION get_metric_0234(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0234] 维护类接口
    PROCEDURE set_metric_0234(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0235] 查询类接口
    FUNCTION get_metric_0235(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0235] 维护类接口
    PROCEDURE set_metric_0235(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0236] 查询类接口
    FUNCTION get_metric_0236(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0236] 维护类接口
    PROCEDURE set_metric_0236(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0237] 查询类接口
    FUNCTION get_metric_0237(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0237] 维护类接口
    PROCEDURE set_metric_0237(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0238] 查询类接口
    FUNCTION get_metric_0238(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0238] 维护类接口
    PROCEDURE set_metric_0238(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0239] 查询类接口
    FUNCTION get_metric_0239(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0239] 维护类接口
    PROCEDURE set_metric_0239(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0240] 查询类接口
    FUNCTION get_metric_0240(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0240] 维护类接口
    PROCEDURE set_metric_0240(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0241] 查询类接口
    FUNCTION get_metric_0241(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0241] 维护类接口
    PROCEDURE set_metric_0241(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0242] 查询类接口
    FUNCTION get_metric_0242(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0242] 维护类接口
    PROCEDURE set_metric_0242(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0243] 查询类接口
    FUNCTION get_metric_0243(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0243] 维护类接口
    PROCEDURE set_metric_0243(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0244] 查询类接口
    FUNCTION get_metric_0244(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0244] 维护类接口
    PROCEDURE set_metric_0244(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0245] 查询类接口
    FUNCTION get_metric_0245(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0245] 维护类接口
    PROCEDURE set_metric_0245(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0246] 查询类接口
    FUNCTION get_metric_0246(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0246] 维护类接口
    PROCEDURE set_metric_0246(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0247] 查询类接口
    FUNCTION get_metric_0247(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0247] 维护类接口
    PROCEDURE set_metric_0247(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0248] 查询类接口
    FUNCTION get_metric_0248(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0248] 维护类接口
    PROCEDURE set_metric_0248(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0249] 查询类接口
    FUNCTION get_metric_0249(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0249] 维护类接口
    PROCEDURE set_metric_0249(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0250] 查询类接口
    FUNCTION get_metric_0250(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0250] 维护类接口
    PROCEDURE set_metric_0250(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0251] 查询类接口
    FUNCTION get_metric_0251(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0251] 维护类接口
    PROCEDURE set_metric_0251(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0252] 查询类接口
    FUNCTION get_metric_0252(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0252] 维护类接口
    PROCEDURE set_metric_0252(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0253] 查询类接口
    FUNCTION get_metric_0253(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0253] 维护类接口
    PROCEDURE set_metric_0253(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0254] 查询类接口
    FUNCTION get_metric_0254(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0254] 维护类接口
    PROCEDURE set_metric_0254(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0255] 查询类接口
    FUNCTION get_metric_0255(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0255] 维护类接口
    PROCEDURE set_metric_0255(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0256] 查询类接口
    FUNCTION get_metric_0256(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0256] 维护类接口
    PROCEDURE set_metric_0256(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0257] 查询类接口
    FUNCTION get_metric_0257(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0257] 维护类接口
    PROCEDURE set_metric_0257(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0258] 查询类接口
    FUNCTION get_metric_0258(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0258] 维护类接口
    PROCEDURE set_metric_0258(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0259] 查询类接口
    FUNCTION get_metric_0259(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0259] 维护类接口
    PROCEDURE set_metric_0259(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0260] 查询类接口
    FUNCTION get_metric_0260(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0260] 维护类接口
    PROCEDURE set_metric_0260(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0261] 查询类接口
    FUNCTION get_metric_0261(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0261] 维护类接口
    PROCEDURE set_metric_0261(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0262] 查询类接口
    FUNCTION get_metric_0262(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0262] 维护类接口
    PROCEDURE set_metric_0262(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0263] 查询类接口
    FUNCTION get_metric_0263(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0263] 维护类接口
    PROCEDURE set_metric_0263(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0264] 查询类接口
    FUNCTION get_metric_0264(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0264] 维护类接口
    PROCEDURE set_metric_0264(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0265] 查询类接口
    FUNCTION get_metric_0265(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0265] 维护类接口
    PROCEDURE set_metric_0265(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0266] 查询类接口
    FUNCTION get_metric_0266(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0266] 维护类接口
    PROCEDURE set_metric_0266(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0267] 查询类接口
    FUNCTION get_metric_0267(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0267] 维护类接口
    PROCEDURE set_metric_0267(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0268] 查询类接口
    FUNCTION get_metric_0268(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0268] 维护类接口
    PROCEDURE set_metric_0268(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0269] 查询类接口
    FUNCTION get_metric_0269(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0269] 维护类接口
    PROCEDURE set_metric_0269(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0270] 查询类接口
    FUNCTION get_metric_0270(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0270] 维护类接口
    PROCEDURE set_metric_0270(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0271] 查询类接口
    FUNCTION get_metric_0271(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0271] 维护类接口
    PROCEDURE set_metric_0271(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0272] 查询类接口
    FUNCTION get_metric_0272(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0272] 维护类接口
    PROCEDURE set_metric_0272(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0273] 查询类接口
    FUNCTION get_metric_0273(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0273] 维护类接口
    PROCEDURE set_metric_0273(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0274] 查询类接口
    FUNCTION get_metric_0274(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0274] 维护类接口
    PROCEDURE set_metric_0274(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0275] 查询类接口
    FUNCTION get_metric_0275(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0275] 维护类接口
    PROCEDURE set_metric_0275(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0276] 查询类接口
    FUNCTION get_metric_0276(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0276] 维护类接口
    PROCEDURE set_metric_0276(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0277] 查询类接口
    FUNCTION get_metric_0277(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0277] 维护类接口
    PROCEDURE set_metric_0277(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0278] 查询类接口
    FUNCTION get_metric_0278(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0278] 维护类接口
    PROCEDURE set_metric_0278(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0279] 查询类接口
    FUNCTION get_metric_0279(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0279] 维护类接口
    PROCEDURE set_metric_0279(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0280] 查询类接口
    FUNCTION get_metric_0280(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0280] 维护类接口
    PROCEDURE set_metric_0280(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0281] 查询类接口
    FUNCTION get_metric_0281(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0281] 维护类接口
    PROCEDURE set_metric_0281(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0282] 查询类接口
    FUNCTION get_metric_0282(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0282] 维护类接口
    PROCEDURE set_metric_0282(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0283] 查询类接口
    FUNCTION get_metric_0283(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0283] 维护类接口
    PROCEDURE set_metric_0283(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0284] 查询类接口
    FUNCTION get_metric_0284(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0284] 维护类接口
    PROCEDURE set_metric_0284(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0285] 查询类接口
    FUNCTION get_metric_0285(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0285] 维护类接口
    PROCEDURE set_metric_0285(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0286] 查询类接口
    FUNCTION get_metric_0286(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0286] 维护类接口
    PROCEDURE set_metric_0286(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0287] 查询类接口
    FUNCTION get_metric_0287(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0287] 维护类接口
    PROCEDURE set_metric_0287(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0288] 查询类接口
    FUNCTION get_metric_0288(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0288] 维护类接口
    PROCEDURE set_metric_0288(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0289] 查询类接口
    FUNCTION get_metric_0289(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0289] 维护类接口
    PROCEDURE set_metric_0289(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0290] 查询类接口
    FUNCTION get_metric_0290(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0290] 维护类接口
    PROCEDURE set_metric_0290(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0291] 查询类接口
    FUNCTION get_metric_0291(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0291] 维护类接口
    PROCEDURE set_metric_0291(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0292] 查询类接口
    FUNCTION get_metric_0292(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0292] 维护类接口
    PROCEDURE set_metric_0292(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0293] 查询类接口
    FUNCTION get_metric_0293(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0293] 维护类接口
    PROCEDURE set_metric_0293(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0294] 查询类接口
    FUNCTION get_metric_0294(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0294] 维护类接口
    PROCEDURE set_metric_0294(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0295] 查询类接口
    FUNCTION get_metric_0295(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0295] 维护类接口
    PROCEDURE set_metric_0295(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0296] 查询类接口
    FUNCTION get_metric_0296(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0296] 维护类接口
    PROCEDURE set_metric_0296(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0297] 查询类接口
    FUNCTION get_metric_0297(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0297] 维护类接口
    PROCEDURE set_metric_0297(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0298] 查询类接口
    FUNCTION get_metric_0298(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0298] 维护类接口
    PROCEDURE set_metric_0298(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0299] 查询类接口
    FUNCTION get_metric_0299(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0299] 维护类接口
    PROCEDURE set_metric_0299(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0300] 查询类接口
    FUNCTION get_metric_0300(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0300] 维护类接口
    PROCEDURE set_metric_0300(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0301] 查询类接口
    FUNCTION get_metric_0301(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0301] 维护类接口
    PROCEDURE set_metric_0301(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0302] 查询类接口
    FUNCTION get_metric_0302(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0302] 维护类接口
    PROCEDURE set_metric_0302(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0303] 查询类接口
    FUNCTION get_metric_0303(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0303] 维护类接口
    PROCEDURE set_metric_0303(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0304] 查询类接口
    FUNCTION get_metric_0304(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0304] 维护类接口
    PROCEDURE set_metric_0304(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0305] 查询类接口
    FUNCTION get_metric_0305(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0305] 维护类接口
    PROCEDURE set_metric_0305(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0306] 查询类接口
    FUNCTION get_metric_0306(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0306] 维护类接口
    PROCEDURE set_metric_0306(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0307] 查询类接口
    FUNCTION get_metric_0307(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0307] 维护类接口
    PROCEDURE set_metric_0307(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0308] 查询类接口
    FUNCTION get_metric_0308(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0308] 维护类接口
    PROCEDURE set_metric_0308(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0309] 查询类接口
    FUNCTION get_metric_0309(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0309] 维护类接口
    PROCEDURE set_metric_0309(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0310] 查询类接口
    FUNCTION get_metric_0310(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0310] 维护类接口
    PROCEDURE set_metric_0310(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0311] 查询类接口
    FUNCTION get_metric_0311(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0311] 维护类接口
    PROCEDURE set_metric_0311(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0312] 查询类接口
    FUNCTION get_metric_0312(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0312] 维护类接口
    PROCEDURE set_metric_0312(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0313] 查询类接口
    FUNCTION get_metric_0313(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0313] 维护类接口
    PROCEDURE set_metric_0313(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0314] 查询类接口
    FUNCTION get_metric_0314(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0314] 维护类接口
    PROCEDURE set_metric_0314(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0315] 查询类接口
    FUNCTION get_metric_0315(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0315] 维护类接口
    PROCEDURE set_metric_0315(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0316] 查询类接口
    FUNCTION get_metric_0316(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0316] 维护类接口
    PROCEDURE set_metric_0316(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0317] 查询类接口
    FUNCTION get_metric_0317(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0317] 维护类接口
    PROCEDURE set_metric_0317(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0318] 查询类接口
    FUNCTION get_metric_0318(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0318] 维护类接口
    PROCEDURE set_metric_0318(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0319] 查询类接口
    FUNCTION get_metric_0319(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0319] 维护类接口
    PROCEDURE set_metric_0319(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0320] 查询类接口
    FUNCTION get_metric_0320(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0320] 维护类接口
    PROCEDURE set_metric_0320(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0321] 查询类接口
    FUNCTION get_metric_0321(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0321] 维护类接口
    PROCEDURE set_metric_0321(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0322] 查询类接口
    FUNCTION get_metric_0322(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0322] 维护类接口
    PROCEDURE set_metric_0322(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0323] 查询类接口
    FUNCTION get_metric_0323(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0323] 维护类接口
    PROCEDURE set_metric_0323(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0324] 查询类接口
    FUNCTION get_metric_0324(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0324] 维护类接口
    PROCEDURE set_metric_0324(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0325] 查询类接口
    FUNCTION get_metric_0325(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0325] 维护类接口
    PROCEDURE set_metric_0325(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0326] 查询类接口
    FUNCTION get_metric_0326(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0326] 维护类接口
    PROCEDURE set_metric_0326(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0327] 查询类接口
    FUNCTION get_metric_0327(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0327] 维护类接口
    PROCEDURE set_metric_0327(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0328] 查询类接口
    FUNCTION get_metric_0328(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0328] 维护类接口
    PROCEDURE set_metric_0328(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0329] 查询类接口
    FUNCTION get_metric_0329(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0329] 维护类接口
    PROCEDURE set_metric_0329(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0330] 查询类接口
    FUNCTION get_metric_0330(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0330] 维护类接口
    PROCEDURE set_metric_0330(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0331] 查询类接口
    FUNCTION get_metric_0331(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0331] 维护类接口
    PROCEDURE set_metric_0331(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0332] 查询类接口
    FUNCTION get_metric_0332(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0332] 维护类接口
    PROCEDURE set_metric_0332(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0333] 查询类接口
    FUNCTION get_metric_0333(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0333] 维护类接口
    PROCEDURE set_metric_0333(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0334] 查询类接口
    FUNCTION get_metric_0334(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0334] 维护类接口
    PROCEDURE set_metric_0334(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0335] 查询类接口
    FUNCTION get_metric_0335(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0335] 维护类接口
    PROCEDURE set_metric_0335(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0336] 查询类接口
    FUNCTION get_metric_0336(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0336] 维护类接口
    PROCEDURE set_metric_0336(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0337] 查询类接口
    FUNCTION get_metric_0337(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0337] 维护类接口
    PROCEDURE set_metric_0337(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0338] 查询类接口
    FUNCTION get_metric_0338(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0338] 维护类接口
    PROCEDURE set_metric_0338(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0339] 查询类接口
    FUNCTION get_metric_0339(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0339] 维护类接口
    PROCEDURE set_metric_0339(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0340] 查询类接口
    FUNCTION get_metric_0340(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0340] 维护类接口
    PROCEDURE set_metric_0340(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0341] 查询类接口
    FUNCTION get_metric_0341(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0341] 维护类接口
    PROCEDURE set_metric_0341(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0342] 查询类接口
    FUNCTION get_metric_0342(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0342] 维护类接口
    PROCEDURE set_metric_0342(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0343] 查询类接口
    FUNCTION get_metric_0343(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0343] 维护类接口
    PROCEDURE set_metric_0343(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0344] 查询类接口
    FUNCTION get_metric_0344(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0344] 维护类接口
    PROCEDURE set_metric_0344(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0345] 查询类接口
    FUNCTION get_metric_0345(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0345] 维护类接口
    PROCEDURE set_metric_0345(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0346] 查询类接口
    FUNCTION get_metric_0346(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0346] 维护类接口
    PROCEDURE set_metric_0346(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0347] 查询类接口
    FUNCTION get_metric_0347(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0347] 维护类接口
    PROCEDURE set_metric_0347(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0348] 查询类接口
    FUNCTION get_metric_0348(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0348] 维护类接口
    PROCEDURE set_metric_0348(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0349] 查询类接口
    FUNCTION get_metric_0349(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0349] 维护类接口
    PROCEDURE set_metric_0349(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0350] 查询类接口
    FUNCTION get_metric_0350(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0350] 维护类接口
    PROCEDURE set_metric_0350(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0351] 查询类接口
    FUNCTION get_metric_0351(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0351] 维护类接口
    PROCEDURE set_metric_0351(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0352] 查询类接口
    FUNCTION get_metric_0352(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0352] 维护类接口
    PROCEDURE set_metric_0352(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0353] 查询类接口
    FUNCTION get_metric_0353(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0353] 维护类接口
    PROCEDURE set_metric_0353(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0354] 查询类接口
    FUNCTION get_metric_0354(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0354] 维护类接口
    PROCEDURE set_metric_0354(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0355] 查询类接口
    FUNCTION get_metric_0355(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0355] 维护类接口
    PROCEDURE set_metric_0355(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0356] 查询类接口
    FUNCTION get_metric_0356(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0356] 维护类接口
    PROCEDURE set_metric_0356(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0357] 查询类接口
    FUNCTION get_metric_0357(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0357] 维护类接口
    PROCEDURE set_metric_0357(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0358] 查询类接口
    FUNCTION get_metric_0358(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0358] 维护类接口
    PROCEDURE set_metric_0358(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0359] 查询类接口
    FUNCTION get_metric_0359(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0359] 维护类接口
    PROCEDURE set_metric_0359(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0360] 查询类接口
    FUNCTION get_metric_0360(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0360] 维护类接口
    PROCEDURE set_metric_0360(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0361] 查询类接口
    FUNCTION get_metric_0361(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0361] 维护类接口
    PROCEDURE set_metric_0361(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0362] 查询类接口
    FUNCTION get_metric_0362(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0362] 维护类接口
    PROCEDURE set_metric_0362(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0363] 查询类接口
    FUNCTION get_metric_0363(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0363] 维护类接口
    PROCEDURE set_metric_0363(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0364] 查询类接口
    FUNCTION get_metric_0364(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0364] 维护类接口
    PROCEDURE set_metric_0364(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0365] 查询类接口
    FUNCTION get_metric_0365(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0365] 维护类接口
    PROCEDURE set_metric_0365(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0366] 查询类接口
    FUNCTION get_metric_0366(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0366] 维护类接口
    PROCEDURE set_metric_0366(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0367] 查询类接口
    FUNCTION get_metric_0367(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0367] 维护类接口
    PROCEDURE set_metric_0367(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0368] 查询类接口
    FUNCTION get_metric_0368(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0368] 维护类接口
    PROCEDURE set_metric_0368(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0369] 查询类接口
    FUNCTION get_metric_0369(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0369] 维护类接口
    PROCEDURE set_metric_0369(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0370] 查询类接口
    FUNCTION get_metric_0370(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0370] 维护类接口
    PROCEDURE set_metric_0370(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0371] 查询类接口
    FUNCTION get_metric_0371(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0371] 维护类接口
    PROCEDURE set_metric_0371(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0372] 查询类接口
    FUNCTION get_metric_0372(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0372] 维护类接口
    PROCEDURE set_metric_0372(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0373] 查询类接口
    FUNCTION get_metric_0373(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0373] 维护类接口
    PROCEDURE set_metric_0373(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0374] 查询类接口
    FUNCTION get_metric_0374(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0374] 维护类接口
    PROCEDURE set_metric_0374(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0375] 查询类接口
    FUNCTION get_metric_0375(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0375] 维护类接口
    PROCEDURE set_metric_0375(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0376] 查询类接口
    FUNCTION get_metric_0376(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0376] 维护类接口
    PROCEDURE set_metric_0376(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0377] 查询类接口
    FUNCTION get_metric_0377(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0377] 维护类接口
    PROCEDURE set_metric_0377(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0378] 查询类接口
    FUNCTION get_metric_0378(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0378] 维护类接口
    PROCEDURE set_metric_0378(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0379] 查询类接口
    FUNCTION get_metric_0379(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0379] 维护类接口
    PROCEDURE set_metric_0379(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0380] 查询类接口
    FUNCTION get_metric_0380(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0380] 维护类接口
    PROCEDURE set_metric_0380(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0381] 查询类接口
    FUNCTION get_metric_0381(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0381] 维护类接口
    PROCEDURE set_metric_0381(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0382] 查询类接口
    FUNCTION get_metric_0382(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0382] 维护类接口
    PROCEDURE set_metric_0382(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0383] 查询类接口
    FUNCTION get_metric_0383(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0383] 维护类接口
    PROCEDURE set_metric_0383(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0384] 查询类接口
    FUNCTION get_metric_0384(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0384] 维护类接口
    PROCEDURE set_metric_0384(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0385] 查询类接口
    FUNCTION get_metric_0385(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0385] 维护类接口
    PROCEDURE set_metric_0385(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0386] 查询类接口
    FUNCTION get_metric_0386(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0386] 维护类接口
    PROCEDURE set_metric_0386(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0387] 查询类接口
    FUNCTION get_metric_0387(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0387] 维护类接口
    PROCEDURE set_metric_0387(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0388] 查询类接口
    FUNCTION get_metric_0388(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0388] 维护类接口
    PROCEDURE set_metric_0388(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0389] 查询类接口
    FUNCTION get_metric_0389(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0389] 维护类接口
    PROCEDURE set_metric_0389(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0390] 查询类接口
    FUNCTION get_metric_0390(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0390] 维护类接口
    PROCEDURE set_metric_0390(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0391] 查询类接口
    FUNCTION get_metric_0391(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0391] 维护类接口
    PROCEDURE set_metric_0391(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0392] 查询类接口
    FUNCTION get_metric_0392(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0392] 维护类接口
    PROCEDURE set_metric_0392(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0393] 查询类接口
    FUNCTION get_metric_0393(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0393] 维护类接口
    PROCEDURE set_metric_0393(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0394] 查询类接口
    FUNCTION get_metric_0394(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0394] 维护类接口
    PROCEDURE set_metric_0394(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0395] 查询类接口
    FUNCTION get_metric_0395(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0395] 维护类接口
    PROCEDURE set_metric_0395(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0396] 查询类接口
    FUNCTION get_metric_0396(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0396] 维护类接口
    PROCEDURE set_metric_0396(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0397] 查询类接口
    FUNCTION get_metric_0397(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0397] 维护类接口
    PROCEDURE set_metric_0397(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0398] 查询类接口
    FUNCTION get_metric_0398(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0398] 维护类接口
    PROCEDURE set_metric_0398(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0399] 查询类接口
    FUNCTION get_metric_0399(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0399] 维护类接口
    PROCEDURE set_metric_0399(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0400] 查询类接口
    FUNCTION get_metric_0400(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0400] 维护类接口
    PROCEDURE set_metric_0400(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0401] 查询类接口
    FUNCTION get_metric_0401(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0401] 维护类接口
    PROCEDURE set_metric_0401(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0402] 查询类接口
    FUNCTION get_metric_0402(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0402] 维护类接口
    PROCEDURE set_metric_0402(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0403] 查询类接口
    FUNCTION get_metric_0403(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0403] 维护类接口
    PROCEDURE set_metric_0403(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0404] 查询类接口
    FUNCTION get_metric_0404(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0404] 维护类接口
    PROCEDURE set_metric_0404(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0405] 查询类接口
    FUNCTION get_metric_0405(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0405] 维护类接口
    PROCEDURE set_metric_0405(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0406] 查询类接口
    FUNCTION get_metric_0406(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0406] 维护类接口
    PROCEDURE set_metric_0406(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0407] 查询类接口
    FUNCTION get_metric_0407(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0407] 维护类接口
    PROCEDURE set_metric_0407(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0408] 查询类接口
    FUNCTION get_metric_0408(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0408] 维护类接口
    PROCEDURE set_metric_0408(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0409] 查询类接口
    FUNCTION get_metric_0409(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0409] 维护类接口
    PROCEDURE set_metric_0409(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0410] 查询类接口
    FUNCTION get_metric_0410(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0410] 维护类接口
    PROCEDURE set_metric_0410(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0411] 查询类接口
    FUNCTION get_metric_0411(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0411] 维护类接口
    PROCEDURE set_metric_0411(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0412] 查询类接口
    FUNCTION get_metric_0412(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0412] 维护类接口
    PROCEDURE set_metric_0412(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0413] 查询类接口
    FUNCTION get_metric_0413(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0413] 维护类接口
    PROCEDURE set_metric_0413(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0414] 查询类接口
    FUNCTION get_metric_0414(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0414] 维护类接口
    PROCEDURE set_metric_0414(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0415] 查询类接口
    FUNCTION get_metric_0415(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0415] 维护类接口
    PROCEDURE set_metric_0415(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0416] 查询类接口
    FUNCTION get_metric_0416(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0416] 维护类接口
    PROCEDURE set_metric_0416(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0417] 查询类接口
    FUNCTION get_metric_0417(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0417] 维护类接口
    PROCEDURE set_metric_0417(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0418] 查询类接口
    FUNCTION get_metric_0418(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0418] 维护类接口
    PROCEDURE set_metric_0418(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0419] 查询类接口
    FUNCTION get_metric_0419(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0419] 维护类接口
    PROCEDURE set_metric_0419(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0420] 查询类接口
    FUNCTION get_metric_0420(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0420] 维护类接口
    PROCEDURE set_metric_0420(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0421] 查询类接口
    FUNCTION get_metric_0421(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0421] 维护类接口
    PROCEDURE set_metric_0421(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0422] 查询类接口
    FUNCTION get_metric_0422(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0422] 维护类接口
    PROCEDURE set_metric_0422(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0423] 查询类接口
    FUNCTION get_metric_0423(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0423] 维护类接口
    PROCEDURE set_metric_0423(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0424] 查询类接口
    FUNCTION get_metric_0424(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0424] 维护类接口
    PROCEDURE set_metric_0424(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0425] 查询类接口
    FUNCTION get_metric_0425(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0425] 维护类接口
    PROCEDURE set_metric_0425(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0426] 查询类接口
    FUNCTION get_metric_0426(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0426] 维护类接口
    PROCEDURE set_metric_0426(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0427] 查询类接口
    FUNCTION get_metric_0427(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0427] 维护类接口
    PROCEDURE set_metric_0427(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0428] 查询类接口
    FUNCTION get_metric_0428(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0428] 维护类接口
    PROCEDURE set_metric_0428(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0429] 查询类接口
    FUNCTION get_metric_0429(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0429] 维护类接口
    PROCEDURE set_metric_0429(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0430] 查询类接口
    FUNCTION get_metric_0430(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0430] 维护类接口
    PROCEDURE set_metric_0430(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0431] 查询类接口
    FUNCTION get_metric_0431(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0431] 维护类接口
    PROCEDURE set_metric_0431(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0432] 查询类接口
    FUNCTION get_metric_0432(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0432] 维护类接口
    PROCEDURE set_metric_0432(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0433] 查询类接口
    FUNCTION get_metric_0433(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0433] 维护类接口
    PROCEDURE set_metric_0433(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0434] 查询类接口
    FUNCTION get_metric_0434(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0434] 维护类接口
    PROCEDURE set_metric_0434(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0435] 查询类接口
    FUNCTION get_metric_0435(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0435] 维护类接口
    PROCEDURE set_metric_0435(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0436] 查询类接口
    FUNCTION get_metric_0436(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0436] 维护类接口
    PROCEDURE set_metric_0436(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0437] 查询类接口
    FUNCTION get_metric_0437(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0437] 维护类接口
    PROCEDURE set_metric_0437(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0438] 查询类接口
    FUNCTION get_metric_0438(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0438] 维护类接口
    PROCEDURE set_metric_0438(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0439] 查询类接口
    FUNCTION get_metric_0439(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0439] 维护类接口
    PROCEDURE set_metric_0439(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0440] 查询类接口
    FUNCTION get_metric_0440(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0440] 维护类接口
    PROCEDURE set_metric_0440(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0441] 查询类接口
    FUNCTION get_metric_0441(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0441] 维护类接口
    PROCEDURE set_metric_0441(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0442] 查询类接口
    FUNCTION get_metric_0442(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0442] 维护类接口
    PROCEDURE set_metric_0442(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0443] 查询类接口
    FUNCTION get_metric_0443(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0443] 维护类接口
    PROCEDURE set_metric_0443(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0444] 查询类接口
    FUNCTION get_metric_0444(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0444] 维护类接口
    PROCEDURE set_metric_0444(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0445] 查询类接口
    FUNCTION get_metric_0445(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0445] 维护类接口
    PROCEDURE set_metric_0445(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0446] 查询类接口
    FUNCTION get_metric_0446(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0446] 维护类接口
    PROCEDURE set_metric_0446(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0447] 查询类接口
    FUNCTION get_metric_0447(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0447] 维护类接口
    PROCEDURE set_metric_0447(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0448] 查询类接口
    FUNCTION get_metric_0448(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0448] 维护类接口
    PROCEDURE set_metric_0448(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0449] 查询类接口
    FUNCTION get_metric_0449(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0449] 维护类接口
    PROCEDURE set_metric_0449(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0450] 查询类接口
    FUNCTION get_metric_0450(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0450] 维护类接口
    PROCEDURE set_metric_0450(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0451] 查询类接口
    FUNCTION get_metric_0451(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0451] 维护类接口
    PROCEDURE set_metric_0451(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0452] 查询类接口
    FUNCTION get_metric_0452(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0452] 维护类接口
    PROCEDURE set_metric_0452(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0453] 查询类接口
    FUNCTION get_metric_0453(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0453] 维护类接口
    PROCEDURE set_metric_0453(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0454] 查询类接口
    FUNCTION get_metric_0454(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0454] 维护类接口
    PROCEDURE set_metric_0454(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0455] 查询类接口
    FUNCTION get_metric_0455(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0455] 维护类接口
    PROCEDURE set_metric_0455(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0456] 查询类接口
    FUNCTION get_metric_0456(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0456] 维护类接口
    PROCEDURE set_metric_0456(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0457] 查询类接口
    FUNCTION get_metric_0457(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0457] 维护类接口
    PROCEDURE set_metric_0457(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0458] 查询类接口
    FUNCTION get_metric_0458(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0458] 维护类接口
    PROCEDURE set_metric_0458(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0459] 查询类接口
    FUNCTION get_metric_0459(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0459] 维护类接口
    PROCEDURE set_metric_0459(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0460] 查询类接口
    FUNCTION get_metric_0460(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0460] 维护类接口
    PROCEDURE set_metric_0460(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0461] 查询类接口
    FUNCTION get_metric_0461(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0461] 维护类接口
    PROCEDURE set_metric_0461(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0462] 查询类接口
    FUNCTION get_metric_0462(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0462] 维护类接口
    PROCEDURE set_metric_0462(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0463] 查询类接口
    FUNCTION get_metric_0463(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0463] 维护类接口
    PROCEDURE set_metric_0463(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0464] 查询类接口
    FUNCTION get_metric_0464(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0464] 维护类接口
    PROCEDURE set_metric_0464(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0465] 查询类接口
    FUNCTION get_metric_0465(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0465] 维护类接口
    PROCEDURE set_metric_0465(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0466] 查询类接口
    FUNCTION get_metric_0466(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0466] 维护类接口
    PROCEDURE set_metric_0466(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0467] 查询类接口
    FUNCTION get_metric_0467(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0467] 维护类接口
    PROCEDURE set_metric_0467(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0468] 查询类接口
    FUNCTION get_metric_0468(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0468] 维护类接口
    PROCEDURE set_metric_0468(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0469] 查询类接口
    FUNCTION get_metric_0469(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0469] 维护类接口
    PROCEDURE set_metric_0469(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0470] 查询类接口
    FUNCTION get_metric_0470(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0470] 维护类接口
    PROCEDURE set_metric_0470(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0471] 查询类接口
    FUNCTION get_metric_0471(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0471] 维护类接口
    PROCEDURE set_metric_0471(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0472] 查询类接口
    FUNCTION get_metric_0472(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0472] 维护类接口
    PROCEDURE set_metric_0472(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0473] 查询类接口
    FUNCTION get_metric_0473(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0473] 维护类接口
    PROCEDURE set_metric_0473(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0474] 查询类接口
    FUNCTION get_metric_0474(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0474] 维护类接口
    PROCEDURE set_metric_0474(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0475] 查询类接口
    FUNCTION get_metric_0475(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0475] 维护类接口
    PROCEDURE set_metric_0475(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0476] 查询类接口
    FUNCTION get_metric_0476(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0476] 维护类接口
    PROCEDURE set_metric_0476(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0477] 查询类接口
    FUNCTION get_metric_0477(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0477] 维护类接口
    PROCEDURE set_metric_0477(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0478] 查询类接口
    FUNCTION get_metric_0478(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0478] 维护类接口
    PROCEDURE set_metric_0478(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0479] 查询类接口
    FUNCTION get_metric_0479(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0479] 维护类接口
    PROCEDURE set_metric_0479(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0480] 查询类接口
    FUNCTION get_metric_0480(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0480] 维护类接口
    PROCEDURE set_metric_0480(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0481] 查询类接口
    FUNCTION get_metric_0481(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0481] 维护类接口
    PROCEDURE set_metric_0481(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0482] 查询类接口
    FUNCTION get_metric_0482(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0482] 维护类接口
    PROCEDURE set_metric_0482(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0483] 查询类接口
    FUNCTION get_metric_0483(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0483] 维护类接口
    PROCEDURE set_metric_0483(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0484] 查询类接口
    FUNCTION get_metric_0484(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0484] 维护类接口
    PROCEDURE set_metric_0484(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0485] 查询类接口
    FUNCTION get_metric_0485(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0485] 维护类接口
    PROCEDURE set_metric_0485(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0486] 查询类接口
    FUNCTION get_metric_0486(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0486] 维护类接口
    PROCEDURE set_metric_0486(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0487] 查询类接口
    FUNCTION get_metric_0487(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0487] 维护类接口
    PROCEDURE set_metric_0487(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0488] 查询类接口
    FUNCTION get_metric_0488(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0488] 维护类接口
    PROCEDURE set_metric_0488(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0489] 查询类接口
    FUNCTION get_metric_0489(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0489] 维护类接口
    PROCEDURE set_metric_0489(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0490] 查询类接口
    FUNCTION get_metric_0490(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0490] 维护类接口
    PROCEDURE set_metric_0490(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0491] 查询类接口
    FUNCTION get_metric_0491(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0491] 维护类接口
    PROCEDURE set_metric_0491(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0492] 查询类接口
    FUNCTION get_metric_0492(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0492] 维护类接口
    PROCEDURE set_metric_0492(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0493] 查询类接口
    FUNCTION get_metric_0493(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0493] 维护类接口
    PROCEDURE set_metric_0493(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0494] 查询类接口
    FUNCTION get_metric_0494(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0494] 维护类接口
    PROCEDURE set_metric_0494(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0495] 查询类接口
    FUNCTION get_metric_0495(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0495] 维护类接口
    PROCEDURE set_metric_0495(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0496] 查询类接口
    FUNCTION get_metric_0496(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0496] 维护类接口
    PROCEDURE set_metric_0496(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0497] 查询类接口
    FUNCTION get_metric_0497(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0497] 维护类接口
    PROCEDURE set_metric_0497(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0498] 查询类接口
    FUNCTION get_metric_0498(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0498] 维护类接口
    PROCEDURE set_metric_0498(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0499] 查询类接口
    FUNCTION get_metric_0499(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0499] 维护类接口
    PROCEDURE set_metric_0499(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0500] 查询类接口
    FUNCTION get_metric_0500(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0500] 维护类接口
    PROCEDURE set_metric_0500(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0501] 查询类接口
    FUNCTION get_metric_0501(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0501] 维护类接口
    PROCEDURE set_metric_0501(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0502] 查询类接口
    FUNCTION get_metric_0502(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0502] 维护类接口
    PROCEDURE set_metric_0502(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0503] 查询类接口
    FUNCTION get_metric_0503(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0503] 维护类接口
    PROCEDURE set_metric_0503(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0504] 查询类接口
    FUNCTION get_metric_0504(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0504] 维护类接口
    PROCEDURE set_metric_0504(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0505] 查询类接口
    FUNCTION get_metric_0505(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0505] 维护类接口
    PROCEDURE set_metric_0505(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0506] 查询类接口
    FUNCTION get_metric_0506(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0506] 维护类接口
    PROCEDURE set_metric_0506(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0507] 查询类接口
    FUNCTION get_metric_0507(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0507] 维护类接口
    PROCEDURE set_metric_0507(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0508] 查询类接口
    FUNCTION get_metric_0508(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0508] 维护类接口
    PROCEDURE set_metric_0508(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0509] 查询类接口
    FUNCTION get_metric_0509(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0509] 维护类接口
    PROCEDURE set_metric_0509(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0510] 查询类接口
    FUNCTION get_metric_0510(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0510] 维护类接口
    PROCEDURE set_metric_0510(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0511] 查询类接口
    FUNCTION get_metric_0511(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0511] 维护类接口
    PROCEDURE set_metric_0511(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0512] 查询类接口
    FUNCTION get_metric_0512(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0512] 维护类接口
    PROCEDURE set_metric_0512(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0513] 查询类接口
    FUNCTION get_metric_0513(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0513] 维护类接口
    PROCEDURE set_metric_0513(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0514] 查询类接口
    FUNCTION get_metric_0514(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0514] 维护类接口
    PROCEDURE set_metric_0514(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0515] 查询类接口
    FUNCTION get_metric_0515(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0515] 维护类接口
    PROCEDURE set_metric_0515(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0516] 查询类接口
    FUNCTION get_metric_0516(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0516] 维护类接口
    PROCEDURE set_metric_0516(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0517] 查询类接口
    FUNCTION get_metric_0517(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0517] 维护类接口
    PROCEDURE set_metric_0517(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0518] 查询类接口
    FUNCTION get_metric_0518(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0518] 维护类接口
    PROCEDURE set_metric_0518(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0519] 查询类接口
    FUNCTION get_metric_0519(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0519] 维护类接口
    PROCEDURE set_metric_0519(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0520] 查询类接口
    FUNCTION get_metric_0520(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0520] 维护类接口
    PROCEDURE set_metric_0520(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0521] 查询类接口
    FUNCTION get_metric_0521(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0521] 维护类接口
    PROCEDURE set_metric_0521(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0522] 查询类接口
    FUNCTION get_metric_0522(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0522] 维护类接口
    PROCEDURE set_metric_0522(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0523] 查询类接口
    FUNCTION get_metric_0523(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0523] 维护类接口
    PROCEDURE set_metric_0523(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0524] 查询类接口
    FUNCTION get_metric_0524(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0524] 维护类接口
    PROCEDURE set_metric_0524(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0525] 查询类接口
    FUNCTION get_metric_0525(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0525] 维护类接口
    PROCEDURE set_metric_0525(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0526] 查询类接口
    FUNCTION get_metric_0526(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0526] 维护类接口
    PROCEDURE set_metric_0526(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0527] 查询类接口
    FUNCTION get_metric_0527(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0527] 维护类接口
    PROCEDURE set_metric_0527(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0528] 查询类接口
    FUNCTION get_metric_0528(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0528] 维护类接口
    PROCEDURE set_metric_0528(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0529] 查询类接口
    FUNCTION get_metric_0529(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0529] 维护类接口
    PROCEDURE set_metric_0529(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0530] 查询类接口
    FUNCTION get_metric_0530(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0530] 维护类接口
    PROCEDURE set_metric_0530(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0531] 查询类接口
    FUNCTION get_metric_0531(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0531] 维护类接口
    PROCEDURE set_metric_0531(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0532] 查询类接口
    FUNCTION get_metric_0532(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0532] 维护类接口
    PROCEDURE set_metric_0532(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0533] 查询类接口
    FUNCTION get_metric_0533(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0533] 维护类接口
    PROCEDURE set_metric_0533(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0534] 查询类接口
    FUNCTION get_metric_0534(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0534] 维护类接口
    PROCEDURE set_metric_0534(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0535] 查询类接口
    FUNCTION get_metric_0535(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0535] 维护类接口
    PROCEDURE set_metric_0535(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0536] 查询类接口
    FUNCTION get_metric_0536(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0536] 维护类接口
    PROCEDURE set_metric_0536(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0537] 查询类接口
    FUNCTION get_metric_0537(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0537] 维护类接口
    PROCEDURE set_metric_0537(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0538] 查询类接口
    FUNCTION get_metric_0538(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0538] 维护类接口
    PROCEDURE set_metric_0538(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0539] 查询类接口
    FUNCTION get_metric_0539(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0539] 维护类接口
    PROCEDURE set_metric_0539(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0540] 查询类接口
    FUNCTION get_metric_0540(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0540] 维护类接口
    PROCEDURE set_metric_0540(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0541] 查询类接口
    FUNCTION get_metric_0541(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0541] 维护类接口
    PROCEDURE set_metric_0541(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0542] 查询类接口
    FUNCTION get_metric_0542(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0542] 维护类接口
    PROCEDURE set_metric_0542(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0543] 查询类接口
    FUNCTION get_metric_0543(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0543] 维护类接口
    PROCEDURE set_metric_0543(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0544] 查询类接口
    FUNCTION get_metric_0544(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0544] 维护类接口
    PROCEDURE set_metric_0544(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0545] 查询类接口
    FUNCTION get_metric_0545(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0545] 维护类接口
    PROCEDURE set_metric_0545(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0546] 查询类接口
    FUNCTION get_metric_0546(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0546] 维护类接口
    PROCEDURE set_metric_0546(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0547] 查询类接口
    FUNCTION get_metric_0547(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0547] 维护类接口
    PROCEDURE set_metric_0547(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0548] 查询类接口
    FUNCTION get_metric_0548(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0548] 维护类接口
    PROCEDURE set_metric_0548(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0549] 查询类接口
    FUNCTION get_metric_0549(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0549] 维护类接口
    PROCEDURE set_metric_0549(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0550] 查询类接口
    FUNCTION get_metric_0550(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0550] 维护类接口
    PROCEDURE set_metric_0550(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0551] 查询类接口
    FUNCTION get_metric_0551(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0551] 维护类接口
    PROCEDURE set_metric_0551(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0552] 查询类接口
    FUNCTION get_metric_0552(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0552] 维护类接口
    PROCEDURE set_metric_0552(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0553] 查询类接口
    FUNCTION get_metric_0553(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0553] 维护类接口
    PROCEDURE set_metric_0553(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0554] 查询类接口
    FUNCTION get_metric_0554(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0554] 维护类接口
    PROCEDURE set_metric_0554(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0555] 查询类接口
    FUNCTION get_metric_0555(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0555] 维护类接口
    PROCEDURE set_metric_0555(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0556] 查询类接口
    FUNCTION get_metric_0556(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0556] 维护类接口
    PROCEDURE set_metric_0556(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0557] 查询类接口
    FUNCTION get_metric_0557(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0557] 维护类接口
    PROCEDURE set_metric_0557(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0558] 查询类接口
    FUNCTION get_metric_0558(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0558] 维护类接口
    PROCEDURE set_metric_0558(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0559] 查询类接口
    FUNCTION get_metric_0559(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0559] 维护类接口
    PROCEDURE set_metric_0559(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0560] 查询类接口
    FUNCTION get_metric_0560(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0560] 维护类接口
    PROCEDURE set_metric_0560(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0561] 查询类接口
    FUNCTION get_metric_0561(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0561] 维护类接口
    PROCEDURE set_metric_0561(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0562] 查询类接口
    FUNCTION get_metric_0562(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0562] 维护类接口
    PROCEDURE set_metric_0562(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0563] 查询类接口
    FUNCTION get_metric_0563(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0563] 维护类接口
    PROCEDURE set_metric_0563(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0564] 查询类接口
    FUNCTION get_metric_0564(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0564] 维护类接口
    PROCEDURE set_metric_0564(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0565] 查询类接口
    FUNCTION get_metric_0565(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0565] 维护类接口
    PROCEDURE set_metric_0565(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0566] 查询类接口
    FUNCTION get_metric_0566(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0566] 维护类接口
    PROCEDURE set_metric_0566(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0567] 查询类接口
    FUNCTION get_metric_0567(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0567] 维护类接口
    PROCEDURE set_metric_0567(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0568] 查询类接口
    FUNCTION get_metric_0568(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0568] 维护类接口
    PROCEDURE set_metric_0568(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0569] 查询类接口
    FUNCTION get_metric_0569(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0569] 维护类接口
    PROCEDURE set_metric_0569(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0570] 查询类接口
    FUNCTION get_metric_0570(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0570] 维护类接口
    PROCEDURE set_metric_0570(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0571] 查询类接口
    FUNCTION get_metric_0571(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0571] 维护类接口
    PROCEDURE set_metric_0571(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0572] 查询类接口
    FUNCTION get_metric_0572(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0572] 维护类接口
    PROCEDURE set_metric_0572(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0573] 查询类接口
    FUNCTION get_metric_0573(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0573] 维护类接口
    PROCEDURE set_metric_0573(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0574] 查询类接口
    FUNCTION get_metric_0574(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0574] 维护类接口
    PROCEDURE set_metric_0574(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0575] 查询类接口
    FUNCTION get_metric_0575(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0575] 维护类接口
    PROCEDURE set_metric_0575(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0576] 查询类接口
    FUNCTION get_metric_0576(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0576] 维护类接口
    PROCEDURE set_metric_0576(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0577] 查询类接口
    FUNCTION get_metric_0577(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0577] 维护类接口
    PROCEDURE set_metric_0577(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0578] 查询类接口
    FUNCTION get_metric_0578(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0578] 维护类接口
    PROCEDURE set_metric_0578(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0579] 查询类接口
    FUNCTION get_metric_0579(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0579] 维护类接口
    PROCEDURE set_metric_0579(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0580] 查询类接口
    FUNCTION get_metric_0580(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0580] 维护类接口
    PROCEDURE set_metric_0580(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0581] 查询类接口
    FUNCTION get_metric_0581(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0581] 维护类接口
    PROCEDURE set_metric_0581(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0582] 查询类接口
    FUNCTION get_metric_0582(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0582] 维护类接口
    PROCEDURE set_metric_0582(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0583] 查询类接口
    FUNCTION get_metric_0583(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0583] 维护类接口
    PROCEDURE set_metric_0583(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0584] 查询类接口
    FUNCTION get_metric_0584(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0584] 维护类接口
    PROCEDURE set_metric_0584(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0585] 查询类接口
    FUNCTION get_metric_0585(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0585] 维护类接口
    PROCEDURE set_metric_0585(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0586] 查询类接口
    FUNCTION get_metric_0586(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0586] 维护类接口
    PROCEDURE set_metric_0586(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0587] 查询类接口
    FUNCTION get_metric_0587(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0587] 维护类接口
    PROCEDURE set_metric_0587(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0588] 查询类接口
    FUNCTION get_metric_0588(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0588] 维护类接口
    PROCEDURE set_metric_0588(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0589] 查询类接口
    FUNCTION get_metric_0589(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0589] 维护类接口
    PROCEDURE set_metric_0589(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0590] 查询类接口
    FUNCTION get_metric_0590(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0590] 维护类接口
    PROCEDURE set_metric_0590(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0591] 查询类接口
    FUNCTION get_metric_0591(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0591] 维护类接口
    PROCEDURE set_metric_0591(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0592] 查询类接口
    FUNCTION get_metric_0592(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0592] 维护类接口
    PROCEDURE set_metric_0592(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0593] 查询类接口
    FUNCTION get_metric_0593(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0593] 维护类接口
    PROCEDURE set_metric_0593(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0594] 查询类接口
    FUNCTION get_metric_0594(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0594] 维护类接口
    PROCEDURE set_metric_0594(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0595] 查询类接口
    FUNCTION get_metric_0595(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0595] 维护类接口
    PROCEDURE set_metric_0595(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0596] 查询类接口
    FUNCTION get_metric_0596(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0596] 维护类接口
    PROCEDURE set_metric_0596(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0597] 查询类接口
    FUNCTION get_metric_0597(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0597] 维护类接口
    PROCEDURE set_metric_0597(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0598] 查询类接口
    FUNCTION get_metric_0598(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0598] 维护类接口
    PROCEDURE set_metric_0598(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0599] 查询类接口
    FUNCTION get_metric_0599(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0599] 维护类接口
    PROCEDURE set_metric_0599(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0600] 查询类接口
    FUNCTION get_metric_0600(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0600] 维护类接口
    PROCEDURE set_metric_0600(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0601] 查询类接口
    FUNCTION get_metric_0601(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0601] 维护类接口
    PROCEDURE set_metric_0601(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0602] 查询类接口
    FUNCTION get_metric_0602(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0602] 维护类接口
    PROCEDURE set_metric_0602(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0603] 查询类接口
    FUNCTION get_metric_0603(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0603] 维护类接口
    PROCEDURE set_metric_0603(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0604] 查询类接口
    FUNCTION get_metric_0604(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0604] 维护类接口
    PROCEDURE set_metric_0604(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0605] 查询类接口
    FUNCTION get_metric_0605(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0605] 维护类接口
    PROCEDURE set_metric_0605(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0606] 查询类接口
    FUNCTION get_metric_0606(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0606] 维护类接口
    PROCEDURE set_metric_0606(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0607] 查询类接口
    FUNCTION get_metric_0607(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0607] 维护类接口
    PROCEDURE set_metric_0607(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0608] 查询类接口
    FUNCTION get_metric_0608(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0608] 维护类接口
    PROCEDURE set_metric_0608(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0609] 查询类接口
    FUNCTION get_metric_0609(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0609] 维护类接口
    PROCEDURE set_metric_0609(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0610] 查询类接口
    FUNCTION get_metric_0610(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0610] 维护类接口
    PROCEDURE set_metric_0610(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0611] 查询类接口
    FUNCTION get_metric_0611(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0611] 维护类接口
    PROCEDURE set_metric_0611(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0612] 查询类接口
    FUNCTION get_metric_0612(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0612] 维护类接口
    PROCEDURE set_metric_0612(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0613] 查询类接口
    FUNCTION get_metric_0613(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0613] 维护类接口
    PROCEDURE set_metric_0613(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0614] 查询类接口
    FUNCTION get_metric_0614(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0614] 维护类接口
    PROCEDURE set_metric_0614(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0615] 查询类接口
    FUNCTION get_metric_0615(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0615] 维护类接口
    PROCEDURE set_metric_0615(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0616] 查询类接口
    FUNCTION get_metric_0616(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0616] 维护类接口
    PROCEDURE set_metric_0616(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0617] 查询类接口
    FUNCTION get_metric_0617(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0617] 维护类接口
    PROCEDURE set_metric_0617(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0618] 查询类接口
    FUNCTION get_metric_0618(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0618] 维护类接口
    PROCEDURE set_metric_0618(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0619] 查询类接口
    FUNCTION get_metric_0619(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0619] 维护类接口
    PROCEDURE set_metric_0619(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0620] 查询类接口
    FUNCTION get_metric_0620(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0620] 维护类接口
    PROCEDURE set_metric_0620(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0621] 查询类接口
    FUNCTION get_metric_0621(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0621] 维护类接口
    PROCEDURE set_metric_0621(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0622] 查询类接口
    FUNCTION get_metric_0622(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0622] 维护类接口
    PROCEDURE set_metric_0622(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0623] 查询类接口
    FUNCTION get_metric_0623(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0623] 维护类接口
    PROCEDURE set_metric_0623(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0624] 查询类接口
    FUNCTION get_metric_0624(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0624] 维护类接口
    PROCEDURE set_metric_0624(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0625] 查询类接口
    FUNCTION get_metric_0625(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0625] 维护类接口
    PROCEDURE set_metric_0625(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0626] 查询类接口
    FUNCTION get_metric_0626(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0626] 维护类接口
    PROCEDURE set_metric_0626(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0627] 查询类接口
    FUNCTION get_metric_0627(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0627] 维护类接口
    PROCEDURE set_metric_0627(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0628] 查询类接口
    FUNCTION get_metric_0628(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0628] 维护类接口
    PROCEDURE set_metric_0628(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0629] 查询类接口
    FUNCTION get_metric_0629(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0629] 维护类接口
    PROCEDURE set_metric_0629(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0630] 查询类接口
    FUNCTION get_metric_0630(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0630] 维护类接口
    PROCEDURE set_metric_0630(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0631] 查询类接口
    FUNCTION get_metric_0631(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0631] 维护类接口
    PROCEDURE set_metric_0631(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0632] 查询类接口
    FUNCTION get_metric_0632(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0632] 维护类接口
    PROCEDURE set_metric_0632(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0633] 查询类接口
    FUNCTION get_metric_0633(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0633] 维护类接口
    PROCEDURE set_metric_0633(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0634] 查询类接口
    FUNCTION get_metric_0634(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0634] 维护类接口
    PROCEDURE set_metric_0634(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0635] 查询类接口
    FUNCTION get_metric_0635(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0635] 维护类接口
    PROCEDURE set_metric_0635(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0636] 查询类接口
    FUNCTION get_metric_0636(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0636] 维护类接口
    PROCEDURE set_metric_0636(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0637] 查询类接口
    FUNCTION get_metric_0637(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0637] 维护类接口
    PROCEDURE set_metric_0637(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0638] 查询类接口
    FUNCTION get_metric_0638(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0638] 维护类接口
    PROCEDURE set_metric_0638(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0639] 查询类接口
    FUNCTION get_metric_0639(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0639] 维护类接口
    PROCEDURE set_metric_0639(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0640] 查询类接口
    FUNCTION get_metric_0640(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0640] 维护类接口
    PROCEDURE set_metric_0640(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0641] 查询类接口
    FUNCTION get_metric_0641(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0641] 维护类接口
    PROCEDURE set_metric_0641(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0642] 查询类接口
    FUNCTION get_metric_0642(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0642] 维护类接口
    PROCEDURE set_metric_0642(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0643] 查询类接口
    FUNCTION get_metric_0643(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0643] 维护类接口
    PROCEDURE set_metric_0643(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0644] 查询类接口
    FUNCTION get_metric_0644(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0644] 维护类接口
    PROCEDURE set_metric_0644(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0645] 查询类接口
    FUNCTION get_metric_0645(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0645] 维护类接口
    PROCEDURE set_metric_0645(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0646] 查询类接口
    FUNCTION get_metric_0646(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0646] 维护类接口
    PROCEDURE set_metric_0646(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0647] 查询类接口
    FUNCTION get_metric_0647(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0647] 维护类接口
    PROCEDURE set_metric_0647(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0648] 查询类接口
    FUNCTION get_metric_0648(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0648] 维护类接口
    PROCEDURE set_metric_0648(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0649] 查询类接口
    FUNCTION get_metric_0649(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0649] 维护类接口
    PROCEDURE set_metric_0649(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0650] 查询类接口
    FUNCTION get_metric_0650(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0650] 维护类接口
    PROCEDURE set_metric_0650(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0651] 查询类接口
    FUNCTION get_metric_0651(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0651] 维护类接口
    PROCEDURE set_metric_0651(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0652] 查询类接口
    FUNCTION get_metric_0652(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0652] 维护类接口
    PROCEDURE set_metric_0652(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0653] 查询类接口
    FUNCTION get_metric_0653(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0653] 维护类接口
    PROCEDURE set_metric_0653(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0654] 查询类接口
    FUNCTION get_metric_0654(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0654] 维护类接口
    PROCEDURE set_metric_0654(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0655] 查询类接口
    FUNCTION get_metric_0655(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0655] 维护类接口
    PROCEDURE set_metric_0655(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0656] 查询类接口
    FUNCTION get_metric_0656(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0656] 维护类接口
    PROCEDURE set_metric_0656(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0657] 查询类接口
    FUNCTION get_metric_0657(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0657] 维护类接口
    PROCEDURE set_metric_0657(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0658] 查询类接口
    FUNCTION get_metric_0658(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0658] 维护类接口
    PROCEDURE set_metric_0658(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0659] 查询类接口
    FUNCTION get_metric_0659(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0659] 维护类接口
    PROCEDURE set_metric_0659(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0660] 查询类接口
    FUNCTION get_metric_0660(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0660] 维护类接口
    PROCEDURE set_metric_0660(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0661] 查询类接口
    FUNCTION get_metric_0661(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0661] 维护类接口
    PROCEDURE set_metric_0661(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0662] 查询类接口
    FUNCTION get_metric_0662(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0662] 维护类接口
    PROCEDURE set_metric_0662(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0663] 查询类接口
    FUNCTION get_metric_0663(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0663] 维护类接口
    PROCEDURE set_metric_0663(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0664] 查询类接口
    FUNCTION get_metric_0664(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0664] 维护类接口
    PROCEDURE set_metric_0664(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0665] 查询类接口
    FUNCTION get_metric_0665(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0665] 维护类接口
    PROCEDURE set_metric_0665(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0666] 查询类接口
    FUNCTION get_metric_0666(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0666] 维护类接口
    PROCEDURE set_metric_0666(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0667] 查询类接口
    FUNCTION get_metric_0667(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0667] 维护类接口
    PROCEDURE set_metric_0667(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0668] 查询类接口
    FUNCTION get_metric_0668(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0668] 维护类接口
    PROCEDURE set_metric_0668(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0669] 查询类接口
    FUNCTION get_metric_0669(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0669] 维护类接口
    PROCEDURE set_metric_0669(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0670] 查询类接口
    FUNCTION get_metric_0670(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0670] 维护类接口
    PROCEDURE set_metric_0670(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0671] 查询类接口
    FUNCTION get_metric_0671(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0671] 维护类接口
    PROCEDURE set_metric_0671(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0672] 查询类接口
    FUNCTION get_metric_0672(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0672] 维护类接口
    PROCEDURE set_metric_0672(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0673] 查询类接口
    FUNCTION get_metric_0673(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0673] 维护类接口
    PROCEDURE set_metric_0673(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0674] 查询类接口
    FUNCTION get_metric_0674(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0674] 维护类接口
    PROCEDURE set_metric_0674(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0675] 查询类接口
    FUNCTION get_metric_0675(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0675] 维护类接口
    PROCEDURE set_metric_0675(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0676] 查询类接口
    FUNCTION get_metric_0676(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0676] 维护类接口
    PROCEDURE set_metric_0676(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0677] 查询类接口
    FUNCTION get_metric_0677(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0677] 维护类接口
    PROCEDURE set_metric_0677(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0678] 查询类接口
    FUNCTION get_metric_0678(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0678] 维护类接口
    PROCEDURE set_metric_0678(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0679] 查询类接口
    FUNCTION get_metric_0679(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0679] 维护类接口
    PROCEDURE set_metric_0679(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0680] 查询类接口
    FUNCTION get_metric_0680(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0680] 维护类接口
    PROCEDURE set_metric_0680(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0681] 查询类接口
    FUNCTION get_metric_0681(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0681] 维护类接口
    PROCEDURE set_metric_0681(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0682] 查询类接口
    FUNCTION get_metric_0682(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0682] 维护类接口
    PROCEDURE set_metric_0682(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0683] 查询类接口
    FUNCTION get_metric_0683(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0683] 维护类接口
    PROCEDURE set_metric_0683(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0684] 查询类接口
    FUNCTION get_metric_0684(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0684] 维护类接口
    PROCEDURE set_metric_0684(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0685] 查询类接口
    FUNCTION get_metric_0685(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0685] 维护类接口
    PROCEDURE set_metric_0685(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0686] 查询类接口
    FUNCTION get_metric_0686(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0686] 维护类接口
    PROCEDURE set_metric_0686(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0687] 查询类接口
    FUNCTION get_metric_0687(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0687] 维护类接口
    PROCEDURE set_metric_0687(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0688] 查询类接口
    FUNCTION get_metric_0688(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0688] 维护类接口
    PROCEDURE set_metric_0688(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0689] 查询类接口
    FUNCTION get_metric_0689(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0689] 维护类接口
    PROCEDURE set_metric_0689(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0690] 查询类接口
    FUNCTION get_metric_0690(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0690] 维护类接口
    PROCEDURE set_metric_0690(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0691] 查询类接口
    FUNCTION get_metric_0691(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0691] 维护类接口
    PROCEDURE set_metric_0691(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0692] 查询类接口
    FUNCTION get_metric_0692(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0692] 维护类接口
    PROCEDURE set_metric_0692(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0693] 查询类接口
    FUNCTION get_metric_0693(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0693] 维护类接口
    PROCEDURE set_metric_0693(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0694] 查询类接口
    FUNCTION get_metric_0694(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0694] 维护类接口
    PROCEDURE set_metric_0694(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0695] 查询类接口
    FUNCTION get_metric_0695(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0695] 维护类接口
    PROCEDURE set_metric_0695(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0696] 查询类接口
    FUNCTION get_metric_0696(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0696] 维护类接口
    PROCEDURE set_metric_0696(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0697] 查询类接口
    FUNCTION get_metric_0697(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0697] 维护类接口
    PROCEDURE set_metric_0697(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0698] 查询类接口
    FUNCTION get_metric_0698(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0698] 维护类接口
    PROCEDURE set_metric_0698(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0699] 查询类接口
    FUNCTION get_metric_0699(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0699] 维护类接口
    PROCEDURE set_metric_0699(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0700] 查询类接口
    FUNCTION get_metric_0700(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0700] 维护类接口
    PROCEDURE set_metric_0700(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0701] 查询类接口
    FUNCTION get_metric_0701(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0701] 维护类接口
    PROCEDURE set_metric_0701(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0702] 查询类接口
    FUNCTION get_metric_0702(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0702] 维护类接口
    PROCEDURE set_metric_0702(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0703] 查询类接口
    FUNCTION get_metric_0703(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0703] 维护类接口
    PROCEDURE set_metric_0703(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0704] 查询类接口
    FUNCTION get_metric_0704(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0704] 维护类接口
    PROCEDURE set_metric_0704(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0705] 查询类接口
    FUNCTION get_metric_0705(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0705] 维护类接口
    PROCEDURE set_metric_0705(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0706] 查询类接口
    FUNCTION get_metric_0706(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0706] 维护类接口
    PROCEDURE set_metric_0706(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0707] 查询类接口
    FUNCTION get_metric_0707(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0707] 维护类接口
    PROCEDURE set_metric_0707(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0708] 查询类接口
    FUNCTION get_metric_0708(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0708] 维护类接口
    PROCEDURE set_metric_0708(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0709] 查询类接口
    FUNCTION get_metric_0709(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0709] 维护类接口
    PROCEDURE set_metric_0709(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0710] 查询类接口
    FUNCTION get_metric_0710(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0710] 维护类接口
    PROCEDURE set_metric_0710(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0711] 查询类接口
    FUNCTION get_metric_0711(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0711] 维护类接口
    PROCEDURE set_metric_0711(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0712] 查询类接口
    FUNCTION get_metric_0712(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0712] 维护类接口
    PROCEDURE set_metric_0712(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0713] 查询类接口
    FUNCTION get_metric_0713(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0713] 维护类接口
    PROCEDURE set_metric_0713(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0714] 查询类接口
    FUNCTION get_metric_0714(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0714] 维护类接口
    PROCEDURE set_metric_0714(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0715] 查询类接口
    FUNCTION get_metric_0715(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0715] 维护类接口
    PROCEDURE set_metric_0715(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0716] 查询类接口
    FUNCTION get_metric_0716(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0716] 维护类接口
    PROCEDURE set_metric_0716(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0717] 查询类接口
    FUNCTION get_metric_0717(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0717] 维护类接口
    PROCEDURE set_metric_0717(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0718] 查询类接口
    FUNCTION get_metric_0718(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0718] 维护类接口
    PROCEDURE set_metric_0718(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0719] 查询类接口
    FUNCTION get_metric_0719(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0719] 维护类接口
    PROCEDURE set_metric_0719(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

    -- [0720] 查询类接口
    FUNCTION get_metric_0720(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_mode   IN VARCHAR2 DEFAULT 'FAST'
    ) RETURN NUMBER;

    -- [0720] 维护类接口
    PROCEDURE set_metric_0720(
        p_owner  IN VARCHAR2,
        p_key    IN NUMBER,
        p_value  IN NUMBER
    );

END pkg_long_api;
/
