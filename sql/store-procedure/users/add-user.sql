CREATE PROCEDURE AddUser
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @Email NVARCHAR(50),
    @UserName NVARCHAR(200),
    @JobTitle NVARCHAR(200)
AS
BEGIN
    INSERT INTO Users (FirstName,LastName,Email,UserName,JobTitle)
    VALUES(@FirstName,@LastName,@Email,@UserName,@JobTitle)
END;