import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function AuthForm({ type = "login", onSubmit }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <img src="/assets/logo.jpg" alt="Logo" className="h-60 w-60 object-contain" />
      </div>

      <Card className="w-full max-w-md mx-auto shadow-md">
        <CardHeader>
          <h2 className="text-xl font-semibold text-center">
            {type === "login" ? "Login" : "Register"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Show username for both login and register */}
            <div className="grid gap-2">
              <Label htmlFor="username">{type === "login" ? "Username" : "Full Name"}</Label>
              <Input
                id="username"
                name="username"
                placeholder={type === "login" ? "Your username" : "John Doe"}
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* Only show email input for register */}
            {type === "register" && (
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              {type === "login" ? "Sign In" : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-center text-muted-foreground">
          {type === "login"
            ? "Don’t have an account? Register instead."
            : "Already have an account? Login instead."}
        </CardFooter>
      </Card>
    </>
  );
}
