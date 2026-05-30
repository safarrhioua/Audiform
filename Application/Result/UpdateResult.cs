using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Result
{
    public class UpdateResult
    {
        public string? Message{ get; set; }
        public bool Success { get; set; }

        public static UpdateResult Succesresult (string? message, bool success)
        {
            return new UpdateResult { Message = message, Success = success };
        }
        public static UpdateResult FailedSucces (string? message, bool success)
        {
            return new UpdateResult { Message = message, Success = success };
        }
    }
}
