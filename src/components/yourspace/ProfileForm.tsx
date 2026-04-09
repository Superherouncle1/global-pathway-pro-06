import { User, Mail, Phone, MapPin, BookOpen, FileText } from "lucide-react";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  country: string;
  field_of_study: string;
  bio: string;
  preferred_language: string;
  avatar_url: string;
}

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
}

const fields = [
  { key: "name" as const, label: "Full Name", icon: User, type: "text", placeholder: "Enter your full name" },
  { key: "email" as const, label: "Email Address", icon: Mail, type: "email", placeholder: "you@example.com" },
  { key: "phone" as const, label: "Contact Number", icon: Phone, type: "tel", placeholder: "+1 (555) 000-0000" },
  { key: "country" as const, label: "Country", icon: MapPin, type: "text", placeholder: "e.g. Nigeria, India, Brazil" },
  { key: "field_of_study" as const, label: "Field of Study", icon: BookOpen, type: "text", placeholder: "e.g. Computer Science, Medicine" },
] as const;

const inputClass = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition";

const ProfileForm = ({ profile, onChange }: ProfileFormProps) => {
  const update = (key: keyof ProfileData, value: string) => onChange({ ...profile, [key]: value });

  return (
    <div className="space-y-5">
      {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
        <div key={key}>
          <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Icon className="w-4 h-4 text-muted-foreground" /> {label}
          </label>
          <input
            type={type}
            value={profile[key]}
            onChange={(e) => update(key, e.target.value)}
            placeholder={placeholder}
            className={inputClass}
          />
        </div>
      ))}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> Bio
        </label>
        <textarea
          value={profile.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="Tell the community about yourself..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>
    </div>
  );
};

export default ProfileForm;
