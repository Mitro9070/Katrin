import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image as PDFImage, Font } from '@react-pdf/renderer';
import RobotoRegular from '../fonts/Roboto-Regular.ttf';
import RobotoBold from '../fonts/Roboto-Bold.ttf';

// Регистрация шрифтов
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: RobotoRegular,
      fontWeight: 'normal',
    },
    {
      src: RobotoBold,
      fontWeight: 'bold',
    },
  ],
});

// Определение стилей для PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Roboto',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  image: {
    width: 345,
    height: 237,
    objectFit: 'contain',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    marginTop: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  tableCellLabel: {
    width: '40%',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCellValue: {
    width: '60%',
    fontSize: 12,
  },
});

// Компонент PDF документа
export const DevicePDFDocument = ({ device, id, allParameters, imageData, fields }) => {
  const renderParametersTable = (title, parameters, fieldsArray) => {
    // Фильтруем поля, чтобы оставить только те, что имеют значения
    const filteredFields = fieldsArray.filter(field => parameters && parameters[field.key]);
    if (filteredFields.length === 0) return null; // Если нет значений, не рендерим таблицу

    return (
      <View wrap={false} style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {filteredFields.map((field, index) => (
          <View style={styles.tableRow} key={index}>
            <Text style={styles.tableCellLabel}>{field.label}:</Text>
            <Text style={styles.tableCellValue}>{parameters[field.key]}</Text>
          </View>
        ))}
      </View>
    );
  };
  try {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Условное отображение изображения */}
          {imageData ? (
            <PDFImage src={imageData} style={styles.image} />
          ) : null}

          {/* Название устройства */}
          <Text style={styles.title}>{id}</Text>

          {/* Описание устройства */}
          {device.description && device.description.trim() !== '' ? (
            <Text style={styles.text}>{device.description}</Text>
          ) : null}

          {/* Параметры устройства */}
          {device.options && (
          <>
            {renderParametersTable('Основные параметры', device.options.basic, fields.basicFields)}
            {renderParametersTable('Опции', device.options.opt, fields.optionsFields)}
            {renderParametersTable(
              'Расходные материалы',
              device.options.consumables,
              fields.consumablesFields
            )}
            {allParameters &&
              renderParametersTable('Все параметры', device.options.all, fields.allFields)}
          </>
        )}
        </Page>
      </Document>
    );
  } catch (error) {
    console.error('Ошибка внутри DevicePDFDocument:', error);
    <Document>
        <Page size="A4" style={styles.page}>
          <Text>Ошибка при генерации PDF+</Text>
        </Page>
      </Document>
  }

};