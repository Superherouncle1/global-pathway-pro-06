import { User, Mail, Phone, MapPin, BookOpen, FileText, AlertCircle } from "lucide-react";

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

export interface ProfileErrors {
  name?: string;
  email?: string;
}

interface ProfileFormProps {
  profile: ProfileData;
  onChange: (profile: ProfileData) => void;
  errors?: ProfileErrors;
}

const fields = [
  { key: "name" as const, label: "Full Name", icon: User, type: "text", placeholder: "Enter your full name", required: true },
  { key: "email" as const, label: "Email Address", icon: Mail, type: "email", placeholder: "you@example.com", required: true },
  { key: "phone" as const, label: "Contact Number", icon: Phone, type: "tel", placeholder: "+1 (555) 000-0000", required: false },
  { key: "country" as const, label: "Country", icon: MapPin, type: "text", placeholder: "e.g. Nigeria, India, Brazil", required: false },
  { key: "field_of_study" as const, label: "Field of Study", icon: BookOpen, type: "text", placeholder: "e.g. Computer Science, Medicine", required: false },
] as const;

const inputBase = "w-full px-4 py-3 rounded-xl bg-muted border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition";
const inputValid = "border-border focus:ring-primary/50";
const inputError = "border-destructive focus:ring-destructive/50";

const ProfileForm = ({ profile, onChange, errors = {} }: ProfileFormProps) => {
  const update = (key: keyof ProfileData, value: string) => onChange({ ...profile, [key]: value });

  return (
    <div className="space-y-5">
      {fields.map(({ key, label, icon: Icon, type, placeholder, required }) => {
        const error = (errors as Record<string, string | undefined>)[key];
        return (
          <div key={key}>
            <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" /> {label}
              {required && <span className="text-destructive">*</span>}
            </label>
            <input
              type={type}
              value={profile[key]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className={`${inputBase} ${error ? inputError : inputValid}`}
            />
            {error && (
              <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
          </div>
        );
      })}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" /> Bio
        </label>
        <textarea
          value={profile.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="Tell the community about yourself..."
          rows={3}
          className={`${inputBase} ${inputValid} resize-none`}
        />
      </div>
    </div>
  );
};

export default ProfileForm;
