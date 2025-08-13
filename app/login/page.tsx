"use client";

import Loading from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [creds, setcreds] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [register, setRegister] = useState(false);

  const handleCheck = async (type: "login" | "register") => {
    try {
      const res = await axios.post(`/api/${type}`, creds);
      const uuid = res.data.userId;
      localStorage.setItem("userId", uuid);
      toast.message("Welcome!", {
        position: "top-center",
      });

      return res.data;
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials", {
          position: "top-center",
        });
        return false;
      }
      toast.error("Something went wrong", {
        position: "top-center",
      });
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (register) {
        Loading(true, "Registering...");
        if (creds.password !== creds.confirmPassword) {
          toast.error("Passwords do not match", {
            position: "top-center",
          });
          return;
        }
        const res = await handleCheck("register");

        if (res) {
          router.push("/jobs");
        }
      } else {
        Loading(true, "Logging in...");
        const res = await handleCheck("login");

        if (res) {
          router.push("/jobs");
        }
      }
    } catch (error) {
      toast.error("Something went wrong", {
        position: "top-center",
      });

      console.error(error);
    } finally {
      Loading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = e.target.id;
    const value = e.target.value;

    setcreds({ ...creds, [id]: value });
  };

  return (
    <form
      className="flex items-center justify-center h-[75dvh]"
      onSubmit={handleSubmit}
    >
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>
            <h3>{register ? "Register" : "Login"}</h3>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              required
              minLength={8}
              value={creds.username}
              onChange={(e) => handleInput(e)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              value={creds.password}
              onChange={(e) => handleInput(e)}
            />
          </div>
          {register && (
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={creds.confirmPassword}
                onChange={(e) => handleInput(e)}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant={"link"}
            type="button"
            onClick={() => setRegister((prevVal) => !prevVal)}
          >
            {register ? "Login" : "Register"}
          </Button>
          <Button type="submit">{register ? "Register" : "Login"}</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
