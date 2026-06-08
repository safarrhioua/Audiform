namespace Audiform.Server.Requests
{
    public class UpdateProfile
    {
        public string Fullname{ get; set; }
        public string Email{ get; set; }
        public string PhoneNumber{ get; set; }
        public DateOnly? Dateofbirth { get; set; }
    }
}
