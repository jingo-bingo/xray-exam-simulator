
import { ReactNode } from "react";
import Logo from "@/components/Logo";
import { UserProfile } from "@/components/UserProfile";

interface AppHeaderProps {
  title: string;
  navigation?: ReactNode;
}

export const AppHeader = ({ title, navigation }: AppHeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-medical-border py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Logo size="md" />
          {navigation}
          <h1 className="text-2xl font-bold text-medical-dark">{title}</h1>
        </div>
        <UserProfile />
      </div>
    </header>
  );
};
