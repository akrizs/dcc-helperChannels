interface categoryDescriptor {
  id: string;
  name: string;
}

interface HelperRole {
  name: string;
  id: string;
}

export interface MINGUILD {
  categories: Map<string, categoryDescriptor>;
  channels: Set<string>;
  busyChannels: Set<string>;
  roles: Map<string, HelperRole>;
}
