import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Settings as SettingsIcon, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

export function UserMenu() {
  const { profile, company, role, signOut } = useAuth();
  const navigate = useNavigate();
  const name = profile?.full_name || profile?.email || "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
            {initials(name)}
          </span>
          <span className="hidden text-left leading-tight md:flex md:flex-col">
            <span className="text-xs font-semibold">{name}</span>
            <span className="text-[10px] text-muted-foreground">
              {company?.company_name ?? "Workspace"}
              {role ? ` · ${role}` : ""}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="text-sm">{name}</span>
          <span className="text-xs font-normal text-muted-foreground">{profile?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/team"><Users className="mr-2 h-4 w-4" />Team</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings"><SettingsIcon className="mr-2 h-4 w-4" />Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth", replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
