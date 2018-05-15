export class RoleValidator {
    public role: string;
    public context: string;

    public static canWhat(role, context) {
        switch (role) {
            case 'viewer':
                if (context === 'add') {
                    return false;
                } else if (context === 'delete') {
                    return false;
                } else if (context === 'view') {
                    return true;
                }
                break;
            case 'admin':
                if (context === 'add') {
                    return true;
                } else if (context === 'delete') {
                    return true;
                } else if (context === 'view') {
                    return true;
                }
                break;
        }
    };
};