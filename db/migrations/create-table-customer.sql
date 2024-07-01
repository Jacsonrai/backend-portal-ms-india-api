IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Customer]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Customer] (
        [GroupID] INT IDENTITY(1,1) PRIMARY KEY,
        [Name] NVARCHAR(50),
        [Slug] NVARCHAR(50),
    );
END