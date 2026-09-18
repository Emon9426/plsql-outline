
  CREATE OR REPLACE PACKAGE "APPS"."XXCUST_TEST_PKG" AS

  g_Tab         VARCHAR2(1) := Chr(9);
  g_Change_Line VARCHAR2(2) := Chr(10) || Chr(13);
  g_Line        VARCHAR2(150) := Rpad('-', 150, '-');
  g_Space       VARCHAR2(40) := Chr(38) || 'nbsp';

  g_Last_Updated_Date DATE := SYSDATE;
  g_Last_Updated_By   NUMBER := Fnd_Global.User_Id;
  g_Creation_Date     DATE := SYSDATE;
  g_Created_By        NUMBER := Fnd_Global.User_Id;
  g_Last_Update_Login NUMBER := Fnd_Global.Login_Id;

  g_Request_Id NUMBER := Fnd_Global.Conc_Request_Id;
  g_Session_Id NUMBER := Userenv('sessionid');

  --main
  PROCEDURE Main(Errbuf       OUT VARCHAR2
                ,Retcode      OUT VARCHAR2
                ,p_Parameter1 IN VARCHAR2);

END xxcust_test_pkg;
/
CREATE OR REPLACE PACKAGE BODY "APPS"."XXCUST_TEST_PKG" AS

  -- Global variable
  g_Pkg_Name CONSTANT VARCHAR2(30) := 'xxcust_test_pkg';
  -- Debug Enabled
  l_Debug VARCHAR2(1) := Nvl(Fnd_Profile.Value('AFLOG_ENABLED'), 'N');

  --output
  PROCEDURE Output(p_Content IN VARCHAR2) IS
  BEGIN
    Fnd_File.Put_Line(Fnd_File.Output, p_Content);
  END Output;

--log
  PROCEDURE Log(p_Content IN VARCHAR2) IS
  BEGIN
    Fnd_File.Put_Line(Fnd_File.Log, to_char(sysdate,'yyyy-mm-dd hh24:mi:ss')||'->'||p_Content);
  END Log;
  
  FUNCTION Get_Msg RETURN VARCHAR2 IS
    l_Msg_Count NUMBER;
    l_Msg_Data  VARCHAR2(2000);
  BEGIN
    Fnd_Msg_Pub.Count_And_Get(p_Encoded => Fnd_Api.g_False
                             ,p_Count   => l_Msg_Count
                             ,p_Data    => l_Msg_Data);
    IF l_Msg_Count > 1 THEN
      l_Msg_Data := Fnd_Msg_Pub.Get_Detail(p_Msg_Index => Fnd_Msg_Pub.g_First
                                          ,p_Encoded   => Fnd_Api.g_False);
    END IF;
    RETURN Substr(l_Msg_Data, 1, 4000);
  END;

  PROCEDURE Set_Msg(p_Content IN VARCHAR2) IS
  BEGIN
    Xxcus_Api.Set_Message('XXCUS'
                         ,'XXCUS_CUSTOM_MSG'
                         ,p_Token1          => 'MSG'
                         ,p_Token1_Value    => p_Content);
  END;
  /*==================================================
  Description:
      请求逻辑处理
  History:
      1.00  2026-04-07 10:03:20  admin  Creation
  ==================================================*/
  PROCEDURE Process_Request(p_Init_Msg_List IN VARCHAR2 DEFAULT Fnd_Api.g_False
                           ,p_Commit        IN VARCHAR2 DEFAULT Fnd_Api.g_False
                           ,x_Return_Status OUT NOCOPY VARCHAR2
                           ,x_Msg_Count     OUT NOCOPY NUMBER
                           ,x_Msg_Data      OUT NOCOPY VARCHAR2
                           ,p_Parameter1    IN VARCHAR2) IS
    l_Api_Name       CONSTANT VARCHAR2(30) := 'process_request';
    l_Savepoint_Name CONSTANT VARCHAR2(30) := 'sp_process_request01';
  BEGIN
    -- start activity to create savepoint, check compatibility
    -- and initialize message list, include debug message hint to enter api
    x_Return_Status := Xxcus_Api.Start_Activity(p_Pkg_Name       => g_Pkg_Name
                                               ,p_Api_Name       => l_Api_Name
                                               ,p_Savepoint_Name => l_Savepoint_Name
                                               ,p_Init_Msg_List  => p_Init_Msg_List);
    IF (x_Return_Status = Fnd_Api.g_Ret_Sts_Unexp_Error) THEN
      RAISE Fnd_Api.g_Exc_Unexpected_Error;
    ELSIF (x_Return_Status = Fnd_Api.g_Ret_Sts_Error) THEN
      RAISE Fnd_Api.g_Exc_Error;
    END IF;
    -- API body

    -- logging parameters
    IF l_Debug = 'Y' THEN
      Log('p_parameter1 : ' || p_Parameter1);
    END IF;

    -- todo

    -- API end body
    -- end activity, include debug message hint to exit api
    x_Return_Status := Xxcus_Api.End_Activity(p_Pkg_Name  => g_Pkg_Name
                                             ,p_Api_Name  => l_Api_Name
                                             ,x_Msg_Count => x_Msg_Count
                                             ,x_Msg_Data  => x_Msg_Data);

  EXCEPTION
    WHEN Fnd_Api.g_Exc_Error THEN
      Log(Dbms_Utility.Format_Error_Backtrace);    
      x_Return_Status := Xxcus_Api.Handle_Exceptions(p_Pkg_Name       => g_Pkg_Name
                                                    ,p_Api_Name       => l_Api_Name
                                                    ,p_Savepoint_Name => l_Savepoint_Name
                                                    ,p_Exc_Name       => Xxcus_Api.g_Exc_Name_Error
                                                    ,x_Msg_Count      => x_Msg_Count
                                                    ,x_Msg_Data       => x_Msg_Data);
    WHEN Fnd_Api.g_Exc_Unexpected_Error THEN
      Log(Dbms_Utility.Format_Error_Backtrace);
      x_Return_Status := Xxcus_Api.Handle_Exceptions(p_Pkg_Name       => g_Pkg_Name
                                                    ,p_Api_Name       => l_Api_Name
                                                    ,p_Savepoint_Name => l_Savepoint_Name
                                                    ,p_Exc_Name       => Xxcus_Api.g_Exc_Name_Unexp
                                                    ,x_Msg_Count      => x_Msg_Count
                                                    ,x_Msg_Data       => x_Msg_Data);
    WHEN OTHERS THEN
      Log(Dbms_Utility.Format_Error_Backtrace);    
      x_Return_Status := Xxcus_Api.Handle_Exceptions(p_Pkg_Name       => g_Pkg_Name
                                                    ,p_Api_Name       => l_Api_Name
                                                    ,p_Savepoint_Name => l_Savepoint_Name
                                                    ,p_Exc_Name       => Xxcus_Api.g_Exc_Name_Others
                                                    ,x_Msg_Count      => x_Msg_Count
                                                    ,x_Msg_Data       => x_Msg_Data);
  END Process_Request;
  /*==================================================
  Description:
      请求入口
  History:
      1.00  2026-04-07 10:03:20  admin  Creation
  ==================================================*/
  PROCEDURE Main(Errbuf       OUT VARCHAR2
                ,Retcode      OUT VARCHAR2
                ,p_Parameter1 IN VARCHAR2) IS
    l_Api_Name      VARCHAR2(30) := 'Main';
    l_Return_Status VARCHAR2(30);
    l_Msg_Count     NUMBER;
    l_Msg_Data      VARCHAR2(2000);
    l_Requests      VARCHAR2(2000);
  BEGIN
    Retcode := '0';
    -- concurrent header log
    Xxcus_Conc_Utl.Log_Header;
    -- conc body
    -- call process request api
    Process_Request(p_Init_Msg_List => Fnd_Api.g_True
                   ,p_Commit        => Fnd_Api.g_True
                   ,x_Return_Status => l_Return_Status
                   ,x_Msg_Count     => l_Msg_Count
                   ,x_Msg_Data      => l_Msg_Data
                   ,p_Parameter1    => p_Parameter1);
    IF l_Return_Status = Fnd_Api.g_Ret_Sts_Error THEN
      RAISE Fnd_Api.g_Exc_Error;
    ELSIF l_Return_Status = Fnd_Api.g_Ret_Sts_Unexp_Error THEN
      RAISE Fnd_Api.g_Exc_Unexpected_Error;
    END IF;

    -- conc end body
    -- concurrent footer log
    Xxcus_Conc_Utl.Log_Footer;

  EXCEPTION
    WHEN Fnd_Api.g_Exc_Error THEN
      Xxcus_Conc_Utl.Log_Message_List;
      Retcode := '1';
      Fnd_Msg_Pub.Count_And_Get(p_Encoded => Fnd_Api.g_False
                               ,p_Count   => l_Msg_Count
                               ,p_Data    => l_Msg_Data);
      IF l_Msg_Count > 1 THEN
        l_Msg_Data := Fnd_Msg_Pub.Get_Detail(p_Msg_Index => Fnd_Msg_Pub.g_First
                                            ,p_Encoded   => Fnd_Api.g_False);
      END IF;
      Errbuf := l_Msg_Data;
    WHEN Fnd_Api.g_Exc_Unexpected_Error THEN
      Xxcus_Conc_Utl.Log_Message_List;
      Retcode := '2';
      Fnd_Msg_Pub.Count_And_Get(p_Encoded => Fnd_Api.g_False
                               ,p_Count   => l_Msg_Count
                               ,p_Data    => l_Msg_Data);
      IF l_Msg_Count > 1 THEN
        l_Msg_Data := Fnd_Msg_Pub.Get_Detail(p_Msg_Index => Fnd_Msg_Pub.g_First
                                            ,p_Encoded   => Fnd_Api.g_False);
      END IF;
      Errbuf := l_Msg_Data;
    WHEN OTHERS THEN
      Fnd_Msg_Pub.Add_Exc_Msg(p_Pkg_Name       => g_Pkg_Name
                             ,p_Procedure_Name => 'MAIN'
                             ,p_Error_Text     => Substrb(SQLERRM, 1, 240));
      Xxcus_Conc_Utl.Log_Message_List;
      Retcode := '2';
      Errbuf  := SQLERRM;
  END Main;

END xxcust_test_pkg;
