"use client";

import * as React from "react";
import Link from "next/link";

import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/sidebar";
import {
  RiSlowDownLine,
  RiLeafLine,
  RiNavigationLine,
  RiSpeakLine,
  RiCodeSSlashLine,
  RiGeminiLine,
  RiLinksLine,
  RiDatabase2Line,
} from "@remixicon/react";

// This is sample data.
const data = {
  user: {
    name: "User 1",
    email: "me@anshdevs.in",
    avatar:
      "https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp3/user_itiiaq.png",
  },
  navMain: [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "#",
          icon: RiSlowDownLine,
          isActive: true,
        },
        {
          title: "Previous Travels",
          url: "#",
          icon: RiLeafLine,
        },
        {
          title: "Incident Reports",
          url: "#",
          icon: RiNavigationLine,
        },
        {
          title: "Security",
          url: "#",
          icon: RiSpeakLine,
        },
        // {
        //   title: "API",
        //   url: "#",
        //   icon: RiCodeSSlashLine,
        // },
        {
          title: "Geo Fencing Guide/ SOS",
          url: "#",
          icon: RiGeminiLine,
        },
        {
          title: "Digital Identity Setup",
          url: "#",
          icon: RiLinksLine,
        },
        {
          title: "Archive",
          url: "#",
          icon: RiDatabase2Line,
        },
      ],
    },
  ],
};

function SidebarLogo() {
  const id = React.useId();
  return (
    <div className="flex gap-1 xs:gap-2 px-1 xs:px-2 group-data-[collapsible=icon]:px-0 transition-[padding] duration-200 ease-in-out">
      <Link className="group/logo inline-flex items-center" href="/">
        <span className="sr-only">Yatri Rakshak</span>
        <div className="flex items-center gap-1 xs:gap-2">
          <div
            className="size-6 xs:size-9 group-data-[collapsible=icon]:size-6 xs:group-data-[collapsible=icon]:size-8 transition-[width,height] duration-200 ease-in-out bg-primary rounded flex items-center justify-center"
          >
            <span className="text-primary-foreground font-bold text-xs xs:text-sm">YR</span>
          </div>
          <div className="whitespace-nowrap capitalize font-bold text-sm xs:text-base group-data-[collapsible=icon]:hidden">Yatri Rakshak</div>
        </div>
      </Link>
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="h-12 xs:h-16 max-md:mt-1 xs:max-md:mt-2 mb-1 xs:mb-2 justify-center">
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="-mt-1 xs:-mt-2">
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel className="uppercase text-muted-foreground/65 text-xs xs:text-sm">
              {item.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className="group/menu-button group-data-[collapsible=icon]:px-[3px] xs:group-data-[collapsible=icon]:px-[5px]! font-medium gap-2 xs:gap-3 h-8 xs:h-9 [&>svg]:size-auto text-xs xs:text-sm"
                      tooltip={item.title}
                      isActive={item.isActive}
                    >
                      <a href={item.url}>
                        {item.icon && (
                          <item.icon
                            className="text-muted-foreground/65 group-data-[active=true]/menu-button:text-primary"
                            size={18}
                            aria-hidden="true"
                          />
                        )}
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-2 xs:p-4">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
