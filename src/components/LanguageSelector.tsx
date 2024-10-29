'use client'

import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { useLanguage } from '../hooks/useLanguage';

export default function LanguageSelector() {
    const { language, setLanguage } = useLanguage();

    return (
        <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="ghost">
                {language === 'en' ? 'English' : 'Español'}
            </MenuButton>
            <MenuList>
                <MenuItem onClick={() => setLanguage('en')}>English</MenuItem>
                <MenuItem onClick={() => setLanguage('es')}>Español</MenuItem>
            </MenuList>
        </Menu>
    );
}
