import { HStack, Text, useColorModeValue } from "@chakra-ui/react";
import { AppLogo } from "./AppLogo";
import { useSiteConfig } from "@/src/hooks/useSiteConfig";

interface Props {
  logoSize?: string;
  nameSize?: string;
}
export const AppLogoAndName = ({
  logoSize = "25px",
  nameSize = "lg",
}: Props) => {
  const textColor = useColorModeValue("inherit", "inherit");
  const siteConfig = useSiteConfig();
  return (
    <HStack>
      <AppLogo size={logoSize} src={siteConfig?.siteLogo?.value} />
      <Text fontSize={nameSize} fontWeight="medium" color={textColor}>
        {siteConfig?.siteName?.value}
      </Text>
    </HStack>
  );
};
