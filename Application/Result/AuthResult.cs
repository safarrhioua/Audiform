namespace Application.Result
{
    public class AuthResult
    {
        public bool Success{ get; set; }
        public string ?Message {  get; set; }
        public string ?Role {  get; set; }

        //methods to create success and failed results
        public static AuthResult SuccessResult(bool success,string message, string role)
        {
            return new AuthResult { Success = success, Message = message, Role = role }; 

        }
        public static AuthResult FailedResult(bool success,string message)
        {
            return new AuthResult { Success = success, Message = message }; 

        }


    }
}
