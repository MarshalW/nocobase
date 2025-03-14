import { ArrayItems } from '@formily/antd';
import { ISchema, useField, useFieldSchema } from '@formily/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTableSelectorContext } from '../../../block-provider';
import { useCollection } from '../../../collection-manager';
import { useCollectionFilterOptions, useSortFields } from '../../../collection-manager/action-hooks';
import { GeneralSchemaDesigner, SchemaSettings } from '../../../schema-settings';
import { useSchemaTemplate } from '../../../schema-templates';
import { useDesignable } from '../../hooks';

export const TableSelectorDesigner = () => {
  const { name, title } = useCollection();
  const field = useField();
  const fieldSchema = useFieldSchema();
  const dataSource = useCollectionFilterOptions(name);
  const sortFields = useSortFields(name);
  const { service } = useTableSelectorContext();
  const { t } = useTranslation();
  const { dn } = useDesignable();
  const defaultFilter = fieldSchema?.['x-decorator-props']?.params?.filter || {};
  const defaultSort = fieldSchema?.['x-decorator-props']?.params?.sort || [];
  const sort = defaultSort?.map((item: string) => {
    return item.startsWith('-')
      ? {
          field: item.substring(1),
          direction: 'desc',
        }
      : {
          field: item,
          direction: 'asc',
        };
  });
  const template = useSchemaTemplate();
  const { dragSort } = field.decoratorProps;
  return (
    <GeneralSchemaDesigner template={template} title={title || name} disableInitializer>
      <SchemaSettings.ModalItem
        title={t('Set the data scope')}
        schema={
          {
            type: 'object',
            title: t('Set the data scope'),
            properties: {
              filter: {
                default: defaultFilter,
                // title: '数据范围',
                enum: dataSource,
                'x-component': 'Filter',
                'x-component-props': {},
              },
            },
          } as ISchema
        }
        onSubmit={({ filter }) => {
          const params = field.decoratorProps.params || {};
          params.filter = filter;
          field.decoratorProps.params = params;
          fieldSchema['x-decorator-props']['params'] = params;
          service.run({ ...service.params?.[0], filter });
          dn.emit('patch', {
            schema: {
              ['x-uid']: fieldSchema['x-uid'],
              'x-decorator-props': fieldSchema['x-decorator-props'],
            },
          });
        }}
      />
      {!dragSort && (
        <SchemaSettings.ModalItem
          title={t('Set default sorting rules')}
          components={{ ArrayItems }}
          schema={
            {
              type: 'object',
              title: t('Set default sorting rules'),
              properties: {
                sort: {
                  type: 'array',
                  default: sort,
                  'x-component': 'ArrayItems',
                  'x-decorator': 'FormItem',
                  items: {
                    type: 'object',
                    properties: {
                      space: {
                        type: 'void',
                        'x-component': 'Space',
                        properties: {
                          sort: {
                            type: 'void',
                            'x-decorator': 'FormItem',
                            'x-component': 'ArrayItems.SortHandle',
                          },
                          field: {
                            type: 'string',
                            enum: sortFields,
                            'x-decorator': 'FormItem',
                            'x-component': 'Select',
                            'x-component-props': {
                              style: {
                                width: 260,
                              },
                            },
                          },
                          direction: {
                            type: 'string',
                            'x-decorator': 'FormItem',
                            'x-component': 'Radio.Group',
                            'x-component-props': {
                              optionType: 'button',
                            },
                            enum: [
                              {
                                label: t('ASC'),
                                value: 'asc',
                              },
                              {
                                label: t('DESC'),
                                value: 'desc',
                              },
                            ],
                          },
                          remove: {
                            type: 'void',
                            'x-decorator': 'FormItem',
                            'x-component': 'ArrayItems.Remove',
                          },
                        },
                      },
                    },
                  },
                  properties: {
                    add: {
                      type: 'void',
                      title: t('Add sort field'),
                      'x-component': 'ArrayItems.Addition',
                    },
                  },
                },
              },
            } as ISchema
          }
          onSubmit={({ sort }) => {
            const sortArr = sort.map((item) => {
              return item.direction === 'desc' ? `-${item.field}` : item.field;
            });
            const params = field.decoratorProps.params || {};
            params.sort = sortArr;
            field.decoratorProps.params = params;
            fieldSchema['x-decorator-props']['params'] = params;
            dn.emit('patch', {
              schema: {
                ['x-uid']: fieldSchema['x-uid'],
                'x-decorator-props': fieldSchema['x-decorator-props'],
              },
            });
            service.run({ ...service.params?.[0], sort: sortArr });
          }}
        />
      )}

      <SchemaSettings.SelectItem
        title={t('Records per page')}
        value={field.decoratorProps?.params?.pageSize || 20}
        options={[
          { label: '10', value: 10 },
          { label: '20', value: 20 },
          { label: '50', value: 50 },
          { label: '100', value: 100 },
          { label: '200', value: 200 },
        ]}
        onChange={(pageSize) => {
          const params = field.decoratorProps.params || {};
          params.pageSize = pageSize;
          field.decoratorProps.params = params;
          fieldSchema['x-decorator-props']['params'] = params;
          service.run({ ...service.params?.[0], pageSize });
          dn.emit('patch', {
            schema: {
              ['x-uid']: fieldSchema['x-uid'],
              'x-decorator-props': fieldSchema['x-decorator-props'],
            },
          });
        }}
      />
      <SchemaSettings.Divider />
      <SchemaSettings.Remove
        removeParentsIfNoChildren
        breakRemoveOn={{
          'x-component': 'Grid',
        }}
      />
    </GeneralSchemaDesigner>
  );
};
