import express from 'express';
import path from 'path';
import exphbs from 'express-handlebars';
import isDev from 'isdev';
import expressStaticGzip from 'express-static-gzip';
import httpResponses from '@banterstudiosuk/http-responses';

const port = process.env.PORT || 3100;
const app = express();
const viewsPath = path.resolve(__dirname, '../../build/views');

app.use(httpResponses());

app.disable('x-powered-by');

if (isDev) {
  require('./middleware/expressWebpack').default(app);
}

const handlebarsConfig = {
  defaultLayout: 'index',
  layoutsDir: viewsPath,
};

app.engine('handlebars', exphbs(handlebarsConfig));

app.set('views', viewsPath);

app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use('/js', expressStaticGzip('build/js'));
app.use('/css', expressStaticGzip('build/css'));

app.use(
  isDev
    ? (req, res, next) => require('./router').default(req, res, next)
    : require('./router').default
);

app.use((err, _, res) => {
  res.httpResponse.badImplementation({
    error: isDev ? err.stack : undefined,
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});

export default app;
