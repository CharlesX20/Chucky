import { Controller, Control, FieldValues, Path } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
}

const FormField = <T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = "text",
}: FormFieldProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="label text-lg font-semibold mb-3 block">{label}</FormLabel>
          <FormControl>
            <Input
              className="input rounded-2xl px-5 py-4 text-light-100 border border-light-600/30 focus:border-success-100/50 focus:ring-2 focus:ring-success-100/20 transition-all duration-300"
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage className="text-destructive-100 text-sm mt-2 ml-1" />
        </FormItem>
      )}
    />
  );
};

export default FormField;