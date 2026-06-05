namespace Audiform.Server.Requests
{
    public class Registerrequest
    {
        public string Fullname{ get; set; }=string.Empty;
        public string Email{ get; set; } = string.Empty;
        public string Password{ get; set; } = string.Empty;
        public string Userrole { get; set; } = string.Empty;
    }
}
