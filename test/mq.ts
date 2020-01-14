import * as mqtt from 'mqtt'

describe('mqtt', function () {
    let mq: mqtt.Client;

    beforeAll(function (done) {
        mq = mqtt.connect('mqtt://localhost:1883').once('connect', function () {
            done();
        }).once('error', done);
    });
    afterAll(function (done) {
        mq.end(false, undefined, done);
    });
    it('sub/pub', async function () {
        const topic = 'new-topic';
        const job = new Promise<{
            topic: string
            payload: Buffer
        }>(function (done, fail) {
            mq.subscribe(topic, function (e) {
                e ? fail(e) : mq.once('message', function (topic, payload) {
                    done({
                        topic,
                        payload,
                    });
                });
            });
        });
        const body = 'this is a MQTT message';
        await new Promise<void>(function (done, fail) {
            mq.publish(topic, body, function (e) {
                e ? fail(e) : done();
            });
        });
        const res = await job;
        expect(res.topic).toBe(topic);
        expect(res.payload.toString()).toBe(body);
    });
});