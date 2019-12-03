const navigationConfig = [
    {
        'id'      : 'applications',
        'title'   : 'Applications',
        'type'    : 'group',
        'icon'    : 'apps',
        'children': [
            {
                'id'      : 'registration',
                'title'   : 'Registration',
                'type'    : 'collapse',
                'icon'    : 'how_to_reg',
                'children': [
                    {
                        'id'   : 'registration-forms',
                        'title': 'Registration Forms',
                        'type' : 'item',
                        'url'  : '/app/registration/registration-forms'
                    },
                    {
                        'id'   : 'badges',
                        'title': 'Badges',
                        'type' : 'item',
                        'url'  : '/app/registration/badges'
                    },
                    {
                        'id'   : 'accreditation',
                        'title': 'Accreditation',
                        'type' : 'item',
                        'url'  : '/app/registration/accreditation'
                    },
                    {
                        'id'   : 'category',
                        'title': 'Add New',
                        'type' : 'item',
                        'url'  : '/app/registration/category'
                    }
                ]
            },
            {
                'id'      : 'workshop',
                'title'   : 'Workshop',
                'type'    : 'collapse',
                'icon'    : 'work',
                'children': [
                    {
                        'id'   : 'workshop-forms',
                        'title': 'Workshop-Forms',
                        'type' : 'item',
                        'url'  : '/app/workshop/workshop-forms'
                    },
                    {
                        'id'   : 'workshop-accreditations',
                        'title': 'Workshop Accreditations',
                        'type' : 'item',
                        'url'  : '/app/workshop/workshop-accreditations'
                    },    
                ]
            },
        ]
    },
];

export default navigationConfig;
