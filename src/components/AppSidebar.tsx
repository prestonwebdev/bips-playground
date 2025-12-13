import { useState } from 'react'
import { LayoutDashboard, CreditCard, X, Settings, User, LogOut, HelpCircle, ChevronUp, ChevronRight, PanelLeftClose, PanelLeft, FileSpreadsheet } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface SubMenuItem {
  label: string
  href: string
}

interface MenuItem {
  icon: typeof LayoutDashboard
  label: string
  href: string
  subItems?: SubMenuItem[]
}

const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    href: '/overview',
  },
  {
    icon: FileSpreadsheet,
    label: 'Reports',
    href: '/reports',
  },
  {
    icon: CreditCard,
    label: 'Transactions',
    href: '/transactions',
  },
]

interface AppSidebarProps {
  activePage?: string
  onPageChange?: (page: string) => void
  /** Background color variant for the sidebar */
  sidebarBg?: 'white' | 'gray'
}

export function AppSidebar({ activePage = '/overview', onPageChange, sidebarBg = 'white' }: AppSidebarProps) {
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const { state, toggleSidebar } = useSidebar()

  const handlePageChange = (href: string) => {
    onPageChange?.(href)
  }

  const sidebarBgClass = sidebarBg === 'gray'
    ? 'bg-[var(--color-neutral-g-50)]'
    : 'bg-[var(--color-white)]'

  return (
    <Sidebar collapsible="icon" className={`border-r border-[var(--color-neutral-g-100)] ${sidebarBgClass}`}>
      {/* Header with Logo and Toggle */}
      <SidebarHeader className="border-b-0 px-4 pt-5 pb-0 group-data-[collapsible=icon]:p-4">
        <div className="flex items-center justify-between px-1 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0 group-data-[collapsible=icon]:justify-center">
          {/* Logo - hidden when collapsed */}
          <div className="text-2xl font-bold font-['Poppins'] text-[var(--color-neutral-n-800)] group-data-[collapsible=icon]:hidden">
            bips
          </div>
          {/* Collapse Toggle - shown when expanded */}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-[var(--color-neutral-g-50)] transition-colors text-[var(--color-neutral-n-600)] group-data-[collapsible=icon]:hidden"
          >
            <PanelLeftClose size={18} />
          </button>
          {/* Expand Toggle - shown when collapsed */}
          <button
            onClick={toggleSidebar}
            className="hidden group-data-[collapsible=icon]:flex p-1.5 rounded-md hover:bg-[var(--color-neutral-g-50)] transition-colors text-[var(--color-neutral-n-600)]"
          >
            <PanelLeft size={18} />
          </button>
        </div>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="px-4 pt-4 pb-5 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:pt-4">
        <SidebarGroup className="group-data-[collapsible=icon]:p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-3 group-data-[collapsible=icon]:items-center">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.subItems ? (
                    <Collapsible
                      defaultOpen={activePage?.startsWith('/overview')}
                      className="group/collapsible"
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={activePage === item.href}
                          tooltip={item.label}
                          className="w-full !px-5 !py-3 !h-auto !rounded-full transition-all duration-200 data-[active=true]:bg-[var(--color-neutral-g-50)] data-[active=true]:font-semibold hover:bg-[var(--color-neutral-g-50)] font-medium text-[var(--color-neutral-n-800)] text-[15px] leading-[28px] tracking-[-0.3px] font-['Poppins'] justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!py-0"
                        >
                          <item.icon className="flex-shrink-0" size={20} />
                          <span className="group-data-[collapsible=icon]:hidden flex-1">{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" size={16} />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                        <SidebarMenuSub className="ml-7 mt-1 border-l border-[var(--color-neutral-g-200)] pl-3">
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={activePage === subItem.href}
                                onClick={(e) => {
                                  e.preventDefault()
                                  handlePageChange(subItem.href)
                                }}
                                className="!py-2 !px-3 !rounded-lg text-[14px] font-['Poppins'] text-[var(--color-neutral-n-700)] hover:bg-[var(--color-neutral-g-50)] data-[active=true]:bg-[var(--color-neutral-g-50)] data-[active=true]:font-semibold data-[active=true]:text-[var(--color-neutral-n-800)]"
                              >
                                <a href={subItem.href}>{subItem.label}</a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={activePage === item.href}
                      onClick={(e) => {
                        e.preventDefault()
                        handlePageChange(item.href)
                      }}
                      tooltip={item.label}
                      className="w-full !px-5 !py-3 !h-auto !rounded-full transition-all duration-200 data-[active=true]:bg-[var(--color-neutral-g-50)] data-[active=true]:font-semibold hover:bg-[var(--color-neutral-g-50)] font-medium text-[var(--color-neutral-n-800)] text-[15px] leading-[28px] tracking-[-0.3px] font-['Poppins'] justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-0 group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!py-0"
                    >
                      <a href={item.href} className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                        <item.icon className="flex-shrink-0" size={20} />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Announcement Card - only show when expanded with blur/fade transition */}
        <AnimatePresence mode="wait">
          {showAnnouncement && state === 'expanded' && (
            <motion.div
              className="mt-auto pt-4"
              initial={{ opacity: 0, filter: 'blur(8px)' }}
              animate={{
                opacity: 1,
                filter: 'blur(0px)',
                transition: { duration: 0.2, ease: 'easeOut', delay: 0.2 }
              }}
              exit={{
                opacity: 0,
                filter: 'blur(8px)',
                transition: { duration: 0.05, ease: 'easeOut' }
              }}
            >
              <div className="relative bg-white border border-[var(--color-neutral-g-200)] rounded-[var(--radius-12)] h-[212px] overflow-hidden">
                <div className="flex flex-col h-full">
                  <div className="bg-[var(--color-neutral-g-50)] flex-1" />
                  <div className="px-3 py-2 pt-1">
                    <p className="text-[14px] font-semibold text-[var(--color-neutral-n-800)] leading-[28px] tracking-[-0.28px] font-['Poppins']">
                      Company documents just launched!
                    </p>
                    <p className="text-[13px] font-normal text-[var(--color-neutral-n-600)] leading-[28px] tracking-[-0.26px] font-['Poppins']">
                      See what's new
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAnnouncement(false)}
                    className="absolute top-3 right-2 p-1 hover:bg-[var(--color-neutral-g-50)] rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SidebarContent>

      {/* Footer with Account Dropdown */}
      <SidebarFooter className="px-4 pb-5 pt-0 group-data-[collapsible=icon]:px-3 group-data-[collapsible=icon]:pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full px-2 py-2 rounded-lg hover:bg-[var(--color-neutral-g-50)] transition-colors data-[state=open]:bg-[var(--color-neutral-g-50)] group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!size-12 group-data-[collapsible=icon]:rounded-full group-data-[collapsible=icon]:mx-auto"
                  tooltip={{
                    children: (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">Pied Piper</span>
                        <span className="text-xs text-muted-foreground">contact@piedpiper.com</span>
                      </div>
                    ),
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0 group-data-[collapsible=icon]:justify-center">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:text-base">
                      PP
                    </div>
                    <div className="flex flex-col items-start flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                      <span className="text-[var(--color-neutral-n-800)] text-sm font-semibold font-['Poppins'] truncate w-full text-left">
                        Pied Piper
                      </span>
                      <span className="text-xs text-[var(--color-neutral-n-600)] font-['Poppins'] truncate w-full text-left">
                        contact@piedpiper.com
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="ml-auto flex-shrink-0 group-data-[collapsible=icon]:hidden" size={16} />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              >
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                    PP
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Pied Piper</span>
                    <span className="truncate text-xs text-muted-foreground">
                      contact@piedpiper.com
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <HelpCircle className="h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
