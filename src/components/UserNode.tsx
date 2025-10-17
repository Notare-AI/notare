import { Handle, Position } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader } from '@/components/ui/card';

interface UserNodeData {
  name: string;
  role: string;
  avatarUrl?: string;
}

type UserNodeProps = {
  data: UserNodeData;
};

const UserNode = ({ data }: UserNodeProps) => {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Card className="w-64 shadow-lg border-2 border-primary/20 bg-card">
        <CardHeader className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={data.avatarUrl} alt={data.name} />
              <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-foreground">{data.name}</p>
              <p className="text-sm text-muted-foreground">{data.role}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default UserNode;