namespace Application
{
    public class AuthResult
    {
        public bool Success{ get; set; }
        public string ?Message {  get; set; }

        //methods to create success and failed results
        public static AuthResult SuccessResult(bool success,string message)
        {
            return new AuthResult { Success = true, Message = message }; 

        }
        public static AuthResult FailedResult(bool success,string message)
        {
            return new AuthResult { Success = false, Message = message }; 

        }


    }
}
