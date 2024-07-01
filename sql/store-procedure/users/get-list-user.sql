CREATE PROCEDURE GetUserList
AS
BEGIN
    SELECT 
        UserID,
        FirstName,
        LastName,
        Email,
        UserName,
        JobTitle
    FROM 
        Users
END;