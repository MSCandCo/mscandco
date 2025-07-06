import { apiRoute } from "@/lib/utils";
import axios from "axios";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export const userContext = React.createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState();
  const { data: userSession, status } = useSession();

  useEffect(() => {
    if (userSession) {
      (async () => {
        const { data } = await axios.get(apiRoute("/users/me"), {
          headers: {
            Authorization: `Bearer ${userSession.jwt}`,
          },
        });
        setUser(data);
      })();
    }
  }, [userSession]);
  return (
    <userContext.Provider value={user}>
      {status == "loading" || (status === "authenticated" && !user) ? (
        <div className="fixed h-full w-full z-50 bg-white flex justify-center items-center">
          <Loader2 className="animate-spin h-12 w-12 duration-500 " />
        </div>
      ) : null}
      {children}
    </userContext.Provider>
  );
}

export default UserProvider;
