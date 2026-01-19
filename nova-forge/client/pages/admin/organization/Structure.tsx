import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { organizationService } from '@/services/organization';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown, ChevronRight, User, Users } from 'lucide-react';
import { Department } from '@/types';

const TreeNode = ({ department, level = 0 }: { department: Department; level?: number }) => {
  const isEven = level % 2 === 0;

  return (
    <div className={`relative flex flex-col items-center p-4 animate-fade-in`}>
      <div
        className={`
          relative z-10 w-64 p-4 rounded-xl border border-border shadow-xl transition-all duration-300 hover:scale-105
          ${level === 0 ? 'bg-gradient-to-br from-neon-purple/20 to-neon-magenta/20 border-neon-purple/30' : 'bg-card/50 backdrop-blur-xl'}
        `}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 rounded-lg bg-background/50">
            <Building2 className={`w-5 h-5 ${level === 0 ? 'text-neon-purple' : 'text-neon-cyan'}`} />
          </div>
          <span className="px-2 py-1 rounded-full bg-background/50 text-xs font-medium text-muted-foreground">
            Level {level + 1}
          </span>
        </div>

        <h3 className="text-lg font-bold text-foreground mb-1">{department.name}</h3>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <User className="w-3 h-3" />
          Head: {department.head}
        </div>

        <div className="pt-3 border-t border-border flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Total Staff</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Users className="w-3 h-3 text-primary" />
            {department.employeeCount}
          </span>
        </div>
      </div>

      {/* Connector Line */}
      {level === 0 && (
        <div className="h-10 w-px bg-gradient-to-b from-neon-purple/30 to-neon-cyan/30 my-2" />
      )}
    </div>
  );
};

const Structure: React.FC = () => {
  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: organizationService.getDepartments,
  });

  // Mock hierarchy construction for visual demo
  // In a real app, this would be recursive based on parentId
  const rootDept = departments?.find(d => d.name === 'Human Resources') || departments?.[0]; // Default to first if HR not found
  const childDepts = departments?.filter(d => d.name !== 'Human Resources') || [];

  return (
    <div className="space-y-8 min-h-[80vh]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Organization Structure</h1>
          <p className="text-muted-foreground">Interactive hierarchy chart of all departments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">Expand All</Button>
          <Button variant="outline" className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">Collapse All</Button>
        </div>
      </div>

      <div className="p-8 rounded-2xl border border-border bg-card/20 backdrop-blur-sm overflow-x-auto">
        <div className="min-w-[800px] flex flex-col items-center">
          {/* Root Node (CEO/Management usually, using HR here as mocked root) */}
          {rootDept && <TreeNode department={rootDept} level={0} />}

          {/* Branches */}
          <div className="relative flex justify-center gap-8 mt-4 pt-8 border-t border-border w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-px h-4 bg-neon-cyan/30" />

            {childDepts.map((dept, index) => (
              <div key={dept.id} className="relative">
                {/* Vertical connector from top horizontal line */}
                <div className="absolute top-[-33px] left-1/2 -translate-x-1/2 w-px h-8 bg-border" />
                <TreeNode department={dept} level={1} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Structure;
